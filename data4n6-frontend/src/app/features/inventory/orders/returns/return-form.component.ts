import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideHand, lucideListChecks, lucideBoxes } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SpaFormHeaderComponent } from '../../../../shared/form/spa-form-header.component';
import { ArticuloPickerComponent, ArticuloMin } from '../../shared/articulo-picker/articulo-picker.component';

const BASE = 'http://localhost:8080/api/v1';
const API  = `${BASE}/inventory/ordenes-devolucion/por-articulos`;
const API_ARTICULOS = `${BASE}/inventory/articulos`;

@Component({
  selector: 'app-return-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports, HlmSpinnerImports, HlmIconImports,
    SpaFormHeaderComponent, ArticuloPickerComponent,
  ],
  providers: [provideIcons({ lucideHand, lucideListChecks, lucideBoxes })],
  template: `
    <div class="h-full flex flex-col min-h-0">

      <app-spa-form-header
        icon="lucideHand"
        label="Nueva orden de devolución"
        backRoute="/inventory/orders/returns" />

      <div class="flex-1 flex min-h-0">

        <!-- ── Columna izquierda: campos ─────────────────────────────────── -->
        <div class="w-[27rem] shrink-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-5">

          @if (saveError()) {
            <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ saveError() }}
            </div>
          }

          <div class="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground pt-8">
            <ng-icon hlmIcon name="lucideHand" size="lg" class="opacity-20" />
            <p class="text-xs text-center italic">Campos adicionales próximamente</p>
          </div>

        </div>

        <!-- ── Columna derecha: artículos ─────────────────────────────────── -->
        <div class="flex-1 flex flex-col min-h-0">

          <div class="flex-1 min-h-0 flex flex-col p-4 pb-2">
            <div class="shrink-0 flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideBoxes" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Artículos disponibles</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            @if (articulosError()) {
              <p class="text-xs text-destructive mb-1">Debe añadir al menos un artículo.</p>
            }
            <div class="flex-1 min-h-0">
              @if (loadingArticulos()) {
                <div class="flex items-center justify-center h-full"><hlm-spinner /></div>
              } @else {
                <app-articulo-picker class="h-full"
                  [articulosDisponibles]="articulosDisponibles()"
                  estadoFilter="Prestado"
                  [showSelected]="false"
                  [(value)]="articulosSeleccionados" />
              }
            </div>
          </div>

          <div class="shrink-0 h-0.5 bg-[#005a3b] mx-4 my-1"></div>

          <div class="flex-1 min-h-0 flex flex-col p-4 pt-2 overflow-hidden">
            <div class="shrink-0 flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideListChecks" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Artículos seleccionados</span>
              <div class="flex-1 h-px bg-border"></div>
              @if (articulosSeleccionados().length > 0) {
                <span class="text-xs tabular-nums text-[#005a3b] font-medium">{{ articulosSeleccionados().length }}</span>
              }
            </div>
            <div class="flex-1 min-h-0 overflow-auto border-2 border-border rounded-md">
              @if (articulosSeleccionados().length === 0) {
                <p class="px-4 py-6 text-xs text-muted-foreground text-center italic">Haz clic en un artículo para añadirlo</p>
              } @else {
                <table class="w-full text-xs border-collapse">
                  <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
                    <tr>
                      <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                      <th class="text-left font-normal px-3 py-1.5">Marca</th>
                      <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                      <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (a of articulosSeleccionadosOrdenados(); track a.id; let odd = $odd) {
                      <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                        <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.tipoMaterialNombre ?? '—' }}</td>
                        <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.brandName ?? '—' }}</td>
                        <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.modeloDescripcion ?? '—' }}</td>
                        <td class="px-3 py-1.5 font-mono text-[#005a3b] truncate">{{ a.serialNumber ?? '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>

        </div>

      </div>

      <!-- Footer -->
      <div class="shrink-0 border-t border-border px-6 py-3 flex items-center gap-2 bg-background">
        <div class="flex-1"></div>
        <button hlmBtn variant="destructive" size="sm" (click)="cancel()" [disabled]="saving()">
          Cancelar
        </button>
        <button hlmBtn size="sm" [disabled]="saving()" (click)="save()">
          @if (saving()) { <hlm-spinner class="mr-2" /> }
          Guardar orden
        </button>
      </div>

    </div>
  `,
})
export class ReturnFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly http   = inject(HttpClient);

  readonly articulosDisponibles   = signal<ArticuloMin[]>([]);
  readonly articulosSeleccionados = signal<ArticuloMin[]>([]);
  readonly loadingArticulos       = signal(false);
  readonly saving                 = signal(false);
  readonly saveError              = signal<string | null>(null);
  readonly articulosError         = signal(false);

  private static cmpStr(x: string | null, y: string | null): number {
    return (x ?? '').localeCompare(y ?? '', undefined, { sensitivity: 'base' });
  }

  readonly articulosSeleccionadosOrdenados = computed(() =>
    [...this.articulosSeleccionados()].sort((a, b) =>
      ReturnFormComponent.cmpStr(a.tipoMaterialNombre, b.tipoMaterialNombre) ||
      ReturnFormComponent.cmpStr(a.brandName,          b.brandName)          ||
      ReturnFormComponent.cmpStr(a.modeloDescripcion,  b.modeloDescripcion)  ||
      ReturnFormComponent.cmpStr(a.serialNumber,       b.serialNumber)
    )
  );

  ngOnInit(): void {
    this.loadingArticulos.set(true);
    this.http.get<ArticuloMin[]>(API_ARTICULOS).subscribe({
      next:  data => { this.articulosDisponibles.set(data); this.loadingArticulos.set(false); },
      error: ()   => this.loadingArticulos.set(false),
    });
  }

  save(): void {
    const hasArt = this.articulosSeleccionados().length > 0;
    this.articulosError.set(!hasArt);
    if (!hasArt) return;

    this.saving.set(true);
    this.saveError.set(null);

    const body = { articuloIds: this.articulosSeleccionados().map(a => a.id) };

    this.http.post(API, body).subscribe({
      next:  () => this.router.navigate(['/inventory/orders/returns']),
      error: () => { this.saveError.set('Error al guardar la orden de devolución.'); this.saving.set(false); },
    });
  }

  cancel(): void { this.router.navigate(['/inventory/orders/returns']); }
}
