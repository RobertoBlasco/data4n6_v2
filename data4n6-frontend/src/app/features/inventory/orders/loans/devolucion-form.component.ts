import {
  ChangeDetectionStrategy, Component, OnInit,
  inject, signal, computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucideUndo2, lucidePackageCheck, lucideBuilding2,
  lucideUserCheck, lucideClipboard, lucidePackageOpen, lucideExternalLink,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { FormReadonlyDirective } from '../../../../shared/form/form-readonly.directive';
import { FormBase } from '../../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../../shared/form/spa-form-header.component';
import { SectionHeaderComponent } from '../../../../shared/components/historical-grid/section-header.component';

const BASE = 'http://localhost:8080/api/v1';

interface LineaDetalle {
  id: string;
  articuloSerialNumber: string | null;
  tipoMaterialNombre:   string | null;
  marcaNombre:          string | null;
  modeloDescripcion:    string | null;
  almacenNombre:        string | null;
  devuelta:             boolean;
  ordenDevolucionReferencia: string | null;
  fechaDevolucion:      string | null;
}

interface OrdenPrestamoInfo {
  numeroReferencia:    string;
  unidadOrigenNombre:  string | null;
  agenteOrigenNombre:  string | null;
  unidadDestinoNombre: string | null;
  agenteDestinoNombre: string | null;
  fechaInicio:         string | null;
  fechaDevolucion:     string | null;
  casosReference:      string | null;
  estadoOrdenNombre:   string | null;
}

@Component({
  selector: 'app-devolucion-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    HlmButtonImports, HlmIconImports, HlmInputImports,
    HlmLabelImports, HlmSpinnerImports,
    SpaFormHeaderComponent, FormReadonlyDirective,
    SectionHeaderComponent,
  ],
  providers: [provideIcons({ lucideUndo2, lucidePackageCheck, lucideBuilding2, lucideUserCheck, lucideClipboard, lucidePackageOpen, lucideExternalLink })],
  template: `
    <div class="h-full flex flex-col min-h-0" [appFormReadonly]="formReadonly()">

      <app-spa-form-header
        [icon]="formIcon()"
        [readonly]="isView() ? true : false"
        [label]="headerLabel()"
        [backRoute]="backRoute()" />

      <div class="flex-1 min-h-0 flex overflow-hidden">

        <!-- ── Columna izquierda: datos del préstamo ─────────────────────── -->
        <div class="w-[27rem] shrink-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-5">

          <!-- Orden de préstamo -->
          <div>
            <app-section-header title="Orden de préstamo" icon="lucidePackageOpen" class="mb-2">
              <button hlmBtn variant="ghost" size="icon" class="size-6 shrink-0 text-[#005a3b]"
                title="Ir al préstamo" (click)="goToPrestamo()">
                <ng-icon hlmIcon size="sm" name="lucideExternalLink" />
              </button>
            </app-section-header>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Referencia</label>
              <input hlmInput readonly class="w-full font-mono" style="background-color:#f0f0f0"
                [value]="prestamo()?.numeroReferencia || '—'" />
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideBuilding2" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Origen</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Unidad</label>
              <input hlmInput readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.unidadOrigenNombre || '—'" />
              <label hlmLabel class="pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              <input hlmInput readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.agenteOrigenNombre || '—'" />
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideUserCheck" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Destino</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Unidad</label>
              <input hlmInput readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.unidadDestinoNombre || '—'" />
              <label hlmLabel class="pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              <input hlmInput readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.agenteDestinoNombre || '—'" />
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideClipboard" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Datos adicionales</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
              <label hlmLabel class="whitespace-nowrap">Inicio</label>
              <input hlmInput type="date" readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.fechaInicio?.substring(0, 10) ?? ''" />
              <label hlmLabel class="whitespace-nowrap">Devolución</label>
              <input hlmInput type="date" readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.fechaDevolucion ?? ''" />
              <label hlmLabel class="whitespace-nowrap">Caso</label>
              <input hlmInput readonly class="w-full" style="background-color:#f0f0f0"
                [value]="prestamo()?.casosReference || '—'" />
            </div>
          </div>

        </div>

        <!-- ── Columna derecha ────────────────────────────────────────────── -->
        <div class="flex-1 flex flex-col p-4 gap-3 overflow-hidden">

          @if (loading()) {
            <div class="flex items-center justify-center flex-1"><hlm-spinner /></div>

          } @else if (isView()) {
            <!-- ── MODO VISUALIZACIÓN: artículos devueltos ──────────────── -->
            <app-section-header title="Artículos devueltos" icon="lucidePackageCheck" />
            <div class="flex-1 min-h-0 overflow-auto border-2 border-primary rounded-md">
              <table class="w-full text-xs border-collapse">
                <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
                  <tr>
                    <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                    <th class="text-left font-normal px-3 py-1.5">Marca</th>
                    <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                    <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                    <th class="text-left font-normal px-3 py-1.5">Almacén</th>
                    <th class="text-left font-normal px-3 py-1.5 w-28 whitespace-nowrap">Fecha dev.</th>
                    @if (!devolucionRef) {
                      <th class="text-left font-normal px-3 py-1.5 w-28 whitespace-nowrap">Orden dev.</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (l of lineasVista(); track l.id; let odd = $odd) {
                    <tr class="border-b border-border/40 last:border-0"
                        [class.bg-surface-primary]="odd">
                      <td class="px-3 py-1.5 truncate">{{ l.tipoMaterialNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 truncate">{{ l.marcaNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 truncate">{{ l.modeloDescripcion ?? '—' }}</td>
                      <td class="px-3 py-1.5 font-mono truncate">{{ l.articuloSerialNumber ?? '—' }}</td>
                      <td class="px-3 py-1.5 truncate">{{ l.almacenNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                        {{ l.fechaDevolucion ? (l.fechaDevolucion | date:'dd/MM/yy') : '' }}
                      </td>
                      @if (!devolucionRef) {
                        <td class="px-3 py-1.5 font-mono text-muted-foreground truncate">{{ l.ordenDevolucionReferencia ?? '' }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="text-xs text-muted-foreground shrink-0">
              {{ devueltas() }} artículo{{ devueltas() !== 1 ? 's' : '' }} devuelto{{ devueltas() !== 1 ? 's' : '' }}
              @if (!devolucionRef) { de {{ todasLineas().length }} en préstamo }
            </p>

          } @else {
            <!-- ── MODO ALTA: selección de artículos a devolver ─────────── -->
            <p class="text-xs text-muted-foreground shrink-0">
              Selecciona los artículos que se devuelven. Por defecto están todos marcados.
            </p>

            @if (saveError()) {
              <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive shrink-0">
                {{ saveError() }}
              </div>
            }

            <div class="flex-1 min-h-0 overflow-auto border-2 border-primary rounded-md">
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
                  @for (l of lineasPendientes(); track l.id; let odd = $odd) {
                    <tr class="border-b border-border/40 last:border-0 cursor-pointer"
                      [class.bg-surface-primary]="odd"
                      (click)="toggleLine(l.id)">
                      <td class="px-3 py-1.5">
                        <input type="checkbox" class="size-3.5 cursor-pointer accent-[#005a3b]"
                          [checked]="selected().has(l.id)"
                          (click)="$event.stopPropagation()"
                          (change)="toggleLine(l.id)" />
                      </td>
                      <td class="px-3 py-1.5 truncate">{{ l.tipoMaterialNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 truncate">{{ l.marcaNombre ?? '—' }}</td>
                      <td class="px-3 py-1.5 truncate">{{ l.modeloDescripcion ?? '—' }}</td>
                      <td class="px-3 py-1.5 font-mono truncate">{{ l.articuloSerialNumber ?? '—' }}</td>
                      <td class="px-3 py-1.5 truncate">{{ l.almacenNombre ?? '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="text-xs text-muted-foreground shrink-0">
              {{ selected().size }} de {{ lineasPendientes().length }} artículos seleccionados
            </p>
          }

        </div>
      </div>

      <!-- Footer -->
      @if (!isView()) {
        <div class="shrink-0 border-t border-border px-6 py-3 flex items-center gap-2 bg-background">
          <div class="flex-1"></div>
          <button hlmBtn variant="destructive" size="sm" (click)="cancel()" [disabled]="saving()">
            Cancelar
          </button>
          <button hlmBtn size="sm"
            [disabled]="saving() || selected().size === 0" (click)="save()">
            @if (saving()) { <hlm-spinner class="mr-2 size-3.5" /> }
            @else { <ng-icon hlmIcon size="sm" name="lucideUndo2" class="mr-1" /> }
            Confirmar devolución ({{ selected().size }})
          </button>
        </div>
      }

    </div>
  `,
})
export class DevolucionFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName = 't600_ordenes_devolucion';
  protected override readonly icon             = 'lucidePackageCheck';
  protected override readonly labelSingular    = 'Devolución de préstamo';
  override entityDescription(): string { return this.prestamo()?.numeroReferencia ?? ''; }

  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly http   = inject(HttpClient);

  private ordenPrestamoId = '';
  devolucionRef = '';   // ref de la orden de devolución específica (si se viene desde la rejilla)

  override readonly loading   = signal(true);
  override readonly saving    = signal(false);
  override readonly saveError = signal<string | null>(null);
  readonly prestamo  = signal<OrdenPrestamoInfo | null>(null);

  /** Todas las líneas del préstamo (con estado de devolución) */
  readonly todasLineas = signal<LineaDetalle[]>([]);

  /**
   * Líneas visibles en modo visualización:
   * - Si venimos de una devolución específica (devRef param): solo las de esa devolución
   * - Si no: todas las devueltas
   */
  readonly lineasVista = computed(() => {
    const lineas = this.todasLineas();
    if (this.devolucionRef) {
      return lineas.filter(l => l.ordenDevolucionReferencia === this.devolucionRef);
    }
    return lineas.filter(l => l.devuelta);
  });

  /** Solo las líneas pendientes de devolver */
  readonly lineasPendientes = computed(() =>
    [...this.todasLineas()]
      .filter(l => !l.devuelta)
      .sort((a, b) => {
        const cmp = (x: string | null, y: string | null) =>
          (x ?? '').localeCompare(y ?? '', undefined, { sensitivity: 'base' });
        return cmp(a.tipoMaterialNombre, b.tipoMaterialNombre)
            || cmp(a.marcaNombre, b.marcaNombre)
            || cmp(a.modeloDescripcion, b.modeloDescripcion)
            || cmp(a.articuloSerialNumber, b.articuloSerialNumber);
      })
  );

  readonly devueltas = computed(() => this.lineasVista().length);

  /**
   * Modo visualización:
   * - Si venimos de una devolución específica: siempre vista
   * - Si no: cuando no hay pendientes
   */
  readonly isView = computed(() =>
    !this.loading() && (!!this.devolucionRef || this.lineasPendientes().length === 0)
  );

  readonly selected = signal<Set<string>>(new Set());

  readonly headerLabel = computed(() => {
    const ref = this.prestamo()?.numeroReferencia;
    return ref ? `Devolución — ${ref}` : 'Devolución de préstamo';
  });

  readonly backRoute = computed(() =>
    `/inventory/orders/loans/${this.ordenPrestamoId}`
  );

  readonly allSelected = computed(() =>
    this.lineasPendientes().length > 0 &&
    this.selected().size === this.lineasPendientes().length
  );

  ngOnInit(): void {
    this.loadFormMeta();
    this.ordenPrestamoId = this.route.snapshot.paramMap.get('id') ?? '';
    this.devolucionRef   = this.route.snapshot.queryParamMap.get('devRef') ?? '';

    this.http.get<OrdenPrestamoInfo>(`${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}`)
      .subscribe({ next: o => this.prestamo.set(o) });

    this.http.get<LineaDetalle[]>(
      `${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}/lineas-detalle`
    ).subscribe({
      next: lineas => {
        this.todasLineas.set(lineas);
        const pending = lineas.filter(l => !l.devuelta);
        this.selected.set(new Set(pending.map(l => l.id)));
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
    this.selected.set(
      checked ? new Set(this.lineasPendientes().map(l => l.id)) : new Set()
    );
  }

  save(): void {
    if (this.selected().size === 0) return;
    this.saving.set(true);
    this.saveError.set(null);

    this.http.post(`${BASE}/inventory/ordenes-devolucion`, {
      ordenPrestamoId: this.ordenPrestamoId,
      lineaPrestamoIds: [...this.selected()],
    }).subscribe({
      next:  () => this.router.navigate(['/inventory/orders/loans', this.ordenPrestamoId]),
      error: () => {
        this.saveError.set('Error al registrar la devolución.');
        this.saving.set(false);
      },
    });
  }

  goToPrestamo(): void {
    this.router.navigate(['/inventory/orders/loans', this.ordenPrestamoId]);
  }

  cancel(): void {
    this.router.navigate(['/inventory/orders/loans', this.ordenPrestamoId]);
  }
}
