import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideHand, lucideListChecks, lucideBoxes, lucideUserCheck, lucideArrowLeftRight } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { FormsModule } from '@angular/forms';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { FormReadonlyDirective } from '../../../../shared/form/form-readonly.directive';
import { FormBase } from '../../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../../shared/form/spa-form-header.component';
import { ArticuloPickerComponent, ArticuloMin } from '../../shared/articulo-picker/articulo-picker.component';
import { FkComboboxComponent } from '../../../../shared/components/fk-combobox/fk-combobox.component';

const BASE          = 'http://localhost:8080/api/v1';
const API           = `${BASE}/inventory/ordenes-devolucion/por-articulos`;
const API_ARTICULOS = `${BASE}/inventory/articulos`;
const API_ALMACENES = `${BASE}/inventory/almacenes`;

interface AlmacenMin { id: string; name: string; }

@Component({
  selector: 'app-return-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    HlmButtonImports, HlmSpinnerImports, HlmIconImports,
    HlmLabelImports, HlmInputImports,
    SpaFormHeaderComponent, ArticuloPickerComponent, FkComboboxComponent, FormReadonlyDirective,
  ],
  providers: [provideIcons({ lucideHand, lucideListChecks, lucideBoxes, lucideUserCheck, lucideArrowLeftRight })],
  template: `
    <div class="h-full flex flex-col min-h-0" [appFormReadonly]="formReadonly()">

      <app-spa-form-header
        [icon]="formIcon()"
        [label]="formTitle() || labelSingular"
        backRoute="/inventory/orders/returns" />

      <div class="flex-1 flex min-h-0">

        <!-- ── Columna izquierda: campos ─────────────────────────────────── -->
        <div class="w-[27rem] shrink-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-12">

          @if (saveError()) {
            <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ saveError() }}
            </div>
          }

          <!-- Origen -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideUserCheck" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Origen</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
              <label hlmLabel class="pt-2 whitespace-nowrap">Unidad</label>
              <app-fk-combobox endpoint="/catalog/units" [baseUrl]="BASE"
                [value]="unidadOrigenId()" (valueChange)="unidadOrigenId.set($event)" />
              <label hlmLabel class="pt-2 pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              <app-fk-combobox [endpoint]="agenteOrigenEndpoint()" [baseUrl]="BASE"
                [value]="agenteOrigenId()" [disabled]="!unidadOrigenId()"
                (valueChange)="agenteOrigenId.set($event)" />
            </div>
          </div>

          <!-- Destino -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideArrowLeftRight" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Destino</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
              <label hlmLabel class="pt-2 whitespace-nowrap">Unidad</label>
              <app-fk-combobox endpoint="/catalog/units" [baseUrl]="BASE"
                [value]="unidadDestinoId()" (valueChange)="unidadDestinoId.set($event)" />
              <label hlmLabel class="pt-2 pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              <app-fk-combobox [endpoint]="agenteDestinoEndpoint()" [baseUrl]="BASE"
                [value]="agenteDestinoId()" [disabled]="!unidadDestinoId()"
                (valueChange)="agenteDestinoId.set($event)" />
            </div>
          </div>

          <!-- Datos adicionales -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideHand" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Datos adicionales</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
              <label hlmLabel class="pt-2 whitespace-nowrap">Fecha devolución</label>
              <input hlmInput type="date" class="w-full"
                [value]="fechaDevolucion()" (change)="fechaDevolucion.set($any($event.target).value)" />
              <label hlmLabel class="pt-2 whitespace-nowrap">Almacén destino</label>
              <div>
                <app-fk-combobox endpoint="/api/v1/inventory/almacenes" [baseUrl]="'http://localhost:8080'"
                  [value]="almacenDestinoId()" (valueChange)="almacenDestinoId.set($event)" />
                <p class="text-xs text-muted-foreground mt-1 italic">Solo se aplicará a los artículos que estuvieran en stock (no adjudicados) en el momento del préstamo.</p>
              </div>
            </div>
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
                      <th class="text-left font-normal px-3 py-1.5">Almacén</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (a of articulosSeleccionadosOrdenados(); track a.id; let odd = $odd) {
                      <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                        <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.tipoMaterialNombre ?? '—' }}</td>
                        <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.brandName ?? '—' }}</td>
                        <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.modeloDescripcion ?? '—' }}</td>
                        <td class="px-3 py-1.5 font-mono text-[#005a3b] truncate">{{ a.serialNumber ?? '—' }}</td>
                        <td class="px-2 py-1">
                          <select class="w-full h-6 rounded border border-primary bg-action/5 text-xs text-[#005a3b] px-1 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                            [ngModel]="almacenParaArticulo(a.id)"
                            (ngModelChange)="setAlmacenLinea(a.id, $event)">
                            <option value="">— Sin almacén —</option>
                            @for (alm of almacenes(); track alm.id) {
                              <option [value]="alm.id">{{ alm.name }}</option>
                            }
                          </select>
                        </td>
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
export class ReturnFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName = 't600_ordenes_devolucion';
  protected override readonly icon             = 'lucidePackageCheck';
  protected override readonly labelSingular    = 'Nueva orden de devolución';
  override entityDescription(): string { return ''; }

  private readonly router = inject(Router);
  private readonly http   = inject(HttpClient);

  readonly BASE = BASE;

  readonly articulosDisponibles   = signal<ArticuloMin[]>([]);
  readonly articulosSeleccionados = signal<ArticuloMin[]>([]);
  readonly loadingArticulos       = signal(false);
  override readonly saving        = signal(false);
  override readonly saveError     = signal<string | null>(null);
  readonly articulosError         = signal(false);

  readonly unidadOrigenId   = signal('');
  readonly agenteOrigenId   = signal('');
  readonly unidadDestinoId  = signal('');
  readonly agenteDestinoId  = signal('');
  readonly fechaDevolucion  = signal('');
  readonly almacenDestinoId  = signal('');
  readonly almacenes         = signal<AlmacenMin[]>([]);
  readonly almacenesLinea    = signal(new Map<string, string>());

  readonly agenteOrigenEndpoint  = computed(() =>
    this.unidadOrigenId()  ? `/catalog/agents?unitId=${this.unidadOrigenId()}`  : '/catalog/agents'
  );
  readonly agenteDestinoEndpoint = computed(() =>
    this.unidadDestinoId() ? `/catalog/agents?unitId=${this.unidadDestinoId()}` : '/catalog/agents'
  );

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
    this.loadFormMeta();
    this.loadingArticulos.set(true);
    this.http.get<ArticuloMin[]>(API_ARTICULOS).subscribe({
      next:  data => { this.articulosDisponibles.set(data); this.loadingArticulos.set(false); },
      error: ()   => this.loadingArticulos.set(false),
    });
    this.http.get<AlmacenMin[]>(API_ALMACENES).subscribe({
      next: data => this.almacenes.set(data),
    });
  }

  almacenParaArticulo(articuloId: string): string {
    return this.almacenesLinea().get(articuloId) ?? this.almacenDestinoId();
  }

  setAlmacenLinea(articuloId: string, almacenId: string): void {
    const m = new Map(this.almacenesLinea());
    if (almacenId) {
      m.set(articuloId, almacenId);
    } else {
      m.delete(articuloId); // empty = sin override, vuelve a seguir el global
    }
    this.almacenesLinea.set(m);
  }

  save(): void {
    const hasArt = this.articulosSeleccionados().length > 0;
    this.articulosError.set(!hasArt);
    if (!hasArt) return;

    this.saving.set(true);
    this.saveError.set(null);

    const body = {
      articuloIds:     this.articulosSeleccionados().map(a => a.id),
      agenteOrigenId:  this.agenteOrigenId()  || null,
      unidadOrigenId:  this.unidadOrigenId()  || null,
      agenteDestinoId: this.agenteDestinoId() || null,
      unidadDestinoId: this.unidadDestinoId() || null,
      fechaDevolucion:  this.fechaDevolucion()  || null,
      almacenDestinoId: this.almacenDestinoId() || null,
      almacenPorArticulo: Object.fromEntries(
        this.articulosSeleccionados()
          .map(a => [a.id, this.almacenParaArticulo(a.id)])
          .filter(([, v]) => !!v)
      ),
    };

    this.http.post(API, body).subscribe({
      next:  () => this.router.navigate(['/inventory/orders/returns']),
      error: () => { this.saveError.set('Error al guardar la orden de devolución.'); this.saving.set(false); },
    });
  }

  cancel(): void { this.router.navigate(['/inventory/orders/returns']); }
}
