import {
  ChangeDetectionStrategy, Component, OnInit,
  inject, signal, computed,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideUndo2, lucidePackageCheck, lucideBuilding2, lucideUserCheck, lucideClipboard } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SpaFormHeaderComponent } from '../../../../shared/form/spa-form-header.component';

const BASE = 'http://localhost:8080/api/v1';

interface LineaPendiente {
  id: string;
  articuloId: string | null;
  articuloSerialNumber: string | null;
  tipoMaterialNombre: string | null;
  marcaNombre: string | null;
  modeloDescripcion: string | null;
  almacenNombre: string | null;
}

interface OrdenPrestamoInfo {
  numeroReferencia: string;
  unidadOrigenNombre: string | null;
  agenteOrigenNombre: string | null;
  unidadDestinoNombre: string | null;
  agenteDestinoNombre: string | null;
  fechaInicio: string | null;
  fechaDevolucion: string | null;
  casosReference: string | null;
}

@Component({
  selector: 'app-devolucion-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmButtonImports, HlmIconImports, HlmInputImports, HlmLabelImports, HlmSpinnerImports, SpaFormHeaderComponent],
  providers: [provideIcons({ lucideUndo2, lucidePackageCheck, lucideBuilding2, lucideUserCheck, lucideClipboard })],
  template: `
    <div class="h-full flex flex-col min-h-0">

      <app-spa-form-header
        icon="lucideUndo2"
        [label]="headerLabel()"
        [backRoute]="backRoute()" />

      <div class="flex-1 min-h-0 flex min-h-0 overflow-hidden">

        <!-- ── Columna izquierda: datos del préstamo ─────────────────────── -->
        <div class="w-[27rem] shrink-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-5">

          <!-- Origen -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideBuilding2" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Origen</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Unidad</label>
              <input hlmInput readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.unidadOrigenNombre || '—'" />
              <label hlmLabel class="pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              <input hlmInput readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.agenteOrigenNombre || '—'" />
            </div>
          </div>

          <!-- Destino -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideUserCheck" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Destino</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Unidad</label>
              <input hlmInput readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.unidadDestinoNombre || '—'" />
              <label hlmLabel class="pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              <input hlmInput readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.agenteDestinoNombre || '—'" />
            </div>
          </div>

          <!-- Datos adicionales -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideClipboard" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Datos adicionales</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Inicio</label>
              <input hlmInput type="date" readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.fechaInicio?.substring(0, 10) ?? ''" />
              <label hlmLabel class="whitespace-nowrap">Devolución</label>
              <input hlmInput type="date" readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.fechaDevolucion ?? ''" />
              <label hlmLabel class="whitespace-nowrap">Caso</label>
              <input hlmInput readonly class="w-full" style="background-color: #f0f0f0"
                [value]="prestamo()?.casosReference || '—'" />
            </div>
          </div>

        </div>

        <!-- ── Columna derecha: artículos pendientes ──────────────────────── -->
        <div class="flex-1 flex flex-col p-4 gap-3 overflow-hidden">

          @if (loading()) {
            <div class="flex items-center justify-center flex-1"><hlm-spinner /></div>
          } @else if (lineas().length === 0) {
            <div class="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground">
              <ng-icon hlmIcon name="lucidePackageCheck" size="lg" class="opacity-25" />
              <p class="text-sm">Todos los artículos ya han sido devueltos.</p>
            </div>
          } @else {
            <p class="text-xs text-muted-foreground shrink-0">
              Selecciona los artículos que se devuelven. Por defecto están todos marcados.
            </p>

            @if (saveError()) {
              <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive shrink-0">
                {{ saveError() }}
              </div>
            }

            <div class="flex-1 min-h-0 overflow-auto border-2 border-border rounded-md">
              <table class="w-full text-xs border-collapse">
                <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
                  <tr>
                    <th class="w-8 px-3 py-1.5">
                      <input type="checkbox" class="size-3.5 cursor-pointer accent-white"
                        [checked]="allSelected()"
                        (change)="toggleAll($any($event.target).checked)" />
                    </th>
                    <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                    <th class="text-left font-normal px-3 py-1.5">Marca</th>
                    <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                    <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                    <th class="text-left font-normal px-3 py-1.5">Almacén</th>
                  </tr>
                </thead>
                <tbody>
                  @for (l of lineasOrdenadas(); track l.id; let odd = $odd) {
                    <tr class="border-b border-border/40 last:border-0 cursor-pointer"
                      [class.bg-surface-primary]="odd"
                      (click)="toggleLine(l.id)">
                      <td class="px-3 py-1.5">
                        <input type="checkbox" class="size-3.5 cursor-pointer accent-[#005a3b]"
                          [checked]="selected().has(l.id)"
                          (click)="$event.stopPropagation()"
                          (change)="toggleLine(l.id)" />
                      </td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ l.tipoMaterialNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ l.marcaNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ l.modeloDescripcion ?? '—' }}</td>
                      <td class="px-3 py-1.5 font-mono text-[#005a3b] truncate">{{ l.articuloSerialNumber ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ l.almacenNombre ?? '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <p class="text-xs text-muted-foreground shrink-0">
              {{ selected().size }} de {{ lineas().length }} artículos seleccionados
            </p>
          }

        </div>

      </div>

      <!-- Footer -->
      <div class="shrink-0 border-t border-border px-6 py-3 flex items-center gap-2 bg-background">
        <div class="flex-1"></div>
        <button hlmBtn variant="destructive" size="sm" (click)="cancel()" [disabled]="saving()">
          Cancelar
        </button>
        @if (lineas().length > 0) {
          <button hlmBtn size="sm"
            [disabled]="saving() || selected().size === 0" (click)="save()">
            @if (saving()) { <hlm-spinner class="mr-2 size-3.5" /> }
            @else { <ng-icon hlmIcon size="sm" name="lucideUndo2" class="mr-1" /> }
            Confirmar devolución ({{ selected().size }})
          </button>
        }
      </div>

    </div>
  `,
})
export class DevolucionFormComponent implements OnInit {
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly http    = inject(HttpClient);

  private ordenPrestamoId = '';

  readonly loading   = signal(true);
  readonly saving    = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly lineas    = signal<LineaPendiente[]>([]);
  readonly lineasOrdenadas = computed(() => [...this.lineas()].sort((a, b) => {
    const cmp = (x: string | null, y: string | null) => (x ?? '').localeCompare(y ?? '', undefined, { sensitivity: 'base' });
    return cmp(a.tipoMaterialNombre, b.tipoMaterialNombre)
        || cmp(a.marcaNombre,        b.marcaNombre)
        || cmp(a.modeloDescripcion,  b.modeloDescripcion)
        || cmp(a.articuloSerialNumber, b.articuloSerialNumber);
  }));
  readonly selected  = signal<Set<string>>(new Set());
  readonly prestamo  = signal<OrdenPrestamoInfo | null>(null);

  readonly headerLabel = computed(() => {
    const ref = this.prestamo()?.numeroReferencia;
    return ref ? `Devolución — ${ref}` : 'Registrar devolución';
  });

  readonly backRoute = computed(() =>
    `/inventory/orders/loans/${this.ordenPrestamoId}`
  );

  readonly allSelected = computed(() =>
    this.lineas().length > 0 && this.selected().size === this.lineas().length
  );

  ngOnInit(): void {
    this.ordenPrestamoId = this.route.snapshot.paramMap.get('id') ?? '';

    this.http.get<OrdenPrestamoInfo>(`${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}`)
      .subscribe({ next: o => this.prestamo.set(o) });

    this.http.get<LineaPendiente[]>(
      `${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}/lineas-pendientes`
    ).subscribe({
      next: lineas => {
        this.lineas.set(lineas);
        this.selected.set(new Set(lineas.map(l => l.id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleLine(id: string): void {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  toggleAll(checked: boolean): void {
    this.selected.set(checked ? new Set(this.lineas().map(l => l.id)) : new Set());
  }

  save(): void {
    if (this.selected().size === 0) return;
    this.saving.set(true);
    this.saveError.set(null);

    const body = {
      ordenPrestamoId: this.ordenPrestamoId,
      lineaPrestamoIds: [...this.selected()],
    };

    this.http.post(`${BASE}/inventory/ordenes-devolucion`, body).subscribe({
      next:  () => this.router.navigate(['/inventory/orders/loans']),
      error: () => {
        this.saveError.set('Error al registrar la devolución.');
        this.saving.set(false);
      },
    });
  }

  cancel(): void { this.router.navigate(['/inventory/orders/loans', this.ordenPrestamoId]); }
}
