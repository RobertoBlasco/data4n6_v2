import {
  ChangeDetectionStrategy, Component, ElementRef,
  OnInit, effect, inject, signal, viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import {
  lucidePackageCheck,
  lucidePlus,
  lucideRefreshCw, lucideDownload,
  lucideLayoutList, lucideSlidersHorizontal,
  lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HttpClient } from '@angular/common/http';
import { GridBase } from '../../../../shared/grid/grid-base';

const API           = 'http://localhost:8080/api/v1/inventory/ordenes-devolucion';
const API_ARTICULOS = 'http://localhost:8080/api/v1/inventory/articulos';

interface LineaDevolucion {
  id: string;
  articuloId:         string | null;
  articuloSerialNumber: string | null;
  tipoMaterialId:     string | null;
  tipoMaterialNombre: string | null;
  marcaId:            string | null;
  marcaNombre:        string | null;
  modeloId:           string | null;
  modeloDescripcion:  string | null;
  almacenId:          string | null;
  almacenNombre:      string | null;
}

interface OrdenDevolucion {
  id: string;
  numeroReferencia:        string;
  aprobadoEn:              string;
  ordenPrestamoId:         string;
  ordenPrestamoReferencia: string;
  agenteNombre:            string | null;
  unidadNombre:            string | null;
  numLineasDevueltas:      number;
}

@Component({
  selector: 'app-returns',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    HlmButtonImports, HlmTableImports,
    HlmSpinnerImports, HlmIconImports,
  ],
  providers: [provideIcons({
    lucidePackageCheck, lucidePlus,
    lucideRefreshCw, lucideDownload,
    lucideLayoutList, lucideSlidersHorizontal,
    lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideExternalLink,
  })],
  template: `
    <div [class]="containerCls">

      <!-- ── Cabecera ──────────────────────────────────────────────────────────── -->
      <div [class]="toolbarCls">

        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            <ng-icon hlmIcon size="sm" name="lucidePackageCheck" />{{ gridTitle() }}
          </h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Recargar" (click)="reload()">
              <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
            </button>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Exportar">
              <ng-icon hlmIcon size="sm" name="lucideDownload" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Columnas">
              <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
            </button>
            <button hlmBtn variant="ghost" size="icon"
              [class]="btnNewCls"
              [class.bg-primary-foreground/20]="showAdvancedFilters()"
              title="Filtros avanzados"
              (click)="showAdvancedFilters.set(!showAdvancedFilters())"
            >
              <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Nueva orden" [disabled]="checkingNew()" (click)="goNew()">
              @if (checkingNew()) { <hlm-spinner /> } @else { <ng-icon hlmIcon size="sm" name="lucidePlus" /> }
            </button>
          </div>

        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            @if (selectionCount() === 1) {
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                (click)="goLoan(singleSelected()!)">
                <ng-icon hlmIcon size="sm" name="lucideExternalLink" class="mr-1" />Ir préstamo
              </button>
            }
            <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground">
              <ng-icon hlmIcon size="sm" name="lucideDownload" class="mr-1" />Exportar
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Deseleccionar" (click)="clearSelection()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          </div>
        }

      </div>

      <!-- ── Buscador ──────────────────────────────────────────────────────────── -->
      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar por referencia, préstamo, agente, unidad..."
            [value]="searchInput()"
            (input)="onSearchInput($any($event.target).value)"
          />
          @if (searchInput()) {
            <button class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" (click)="clearSearch()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          }
        </div>
      </div>

      <!-- ── Error nueva orden ─────────────────────────────────────────────────── -->
      @if (newOrderError()) {
        <div class="mx-3 mt-2 shrink-0 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center justify-between">
          <span>{{ newOrderError() }}</span>
          <button class="ml-3 hover:text-destructive/70" (click)="newOrderError.set(null)">
            <ng-icon hlmIcon size="sm" name="lucideX" />
          </button>
        </div>
      }

      <!-- ── Filtros avanzados ──────────────────────────────────────────────────── -->
      @if (showAdvancedFilters()) {
        <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
          <p class="text-xs text-muted-foreground italic">Sin filtros avanzados configurados</p>
        </div>
      }

      <!-- ── Contenido ─────────────────────────────────────────────────────────── -->
      <div class="flex-1 overflow-auto min-h-0">
        @if (loading()) {
          <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
        }
        @if (error() && !loading()) {
          <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <ng-icon hlmIcon size="lg" name="lucidePackageCheck" class="opacity-25" />
            <p class="text-sm">No hay devoluciones registradas</p>
          </div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && searchQuery()) {
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
            <p class="text-sm">Sin resultados para "{{ searchQuery() }}"</p>
            <button hlmBtn variant="outline" size="sm" (click)="clearSearch()">Limpiar búsqueda</button>
          </div>
        }

        @if (!loading() && !error() && totalRecords() > 0) {
          <table hlmTable class="w-full">
            <thead hlmTHead [ngClass]="headerColor">
              <tr hlmTr>
                <th hlmTh class="w-8 pr-0">
                  <input #selectAllCb type="checkbox" class="accent-primary cursor-pointer"
                    [checked]="allSelected()" (change)="toggleSelectAll()" />
                </th>
                <th hlmTh class="w-8 px-0"></th>
                <th hlmTh class="w-28 cursor-pointer select-none" (click)="toggleSort('aprobadoEn', $event)">
                  <div class="flex items-center gap-1">Fecha
                    @if (sortDir('aprobadoEn') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('aprobadoEn') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-36 cursor-pointer select-none" (click)="toggleSort('numeroReferencia', $event)">
                  <div class="flex items-center gap-1">Referencia
                    @if (sortDir('numeroReferencia') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('numeroReferencia') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-36 cursor-pointer select-none" (click)="toggleSort('ordenPrestamoReferencia', $event)">
                  <div class="flex items-center gap-1">Préstamo
                    @if (sortDir('ordenPrestamoReferencia') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('ordenPrestamoReferencia') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('agenteNombre', $event)">
                  <div class="flex items-center gap-1">Agente
                    @if (sortDir('agenteNombre') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('agenteNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('unidadNombre', $event)">
                  <div class="flex items-center gap-1">Unidad
                    @if (sortDir('unidadNombre') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('unidadNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-24 cursor-pointer select-none text-right" (click)="toggleSort('numLineasDevueltas', $event)">
                  <div class="flex items-center justify-end gap-1">Materiales
                    @if (sortDir('numLineasDevueltas') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('numLineasDevueltas') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (o of pageItems(); track o.id; let odd = $odd) {
                <tr hlmTr
                  class="cursor-pointer"
                  [class.bg-action/25]="selectedIds().has(o.id)"
                  [ngClass]="[odd && !selectedIds().has(o.id) ? rowStripeClass : '', rowHoverClass]"
                  (click)="toggleSelectRange(o.id, $index, $event)"
                  (dblclick)="goToDevolucion(o)"
                >
                  <td hlmTd class="pr-0">
                    <input type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="selectedIds().has(o.id)"
                      (click)="toggleSelectRange(o.id, $index, $event)" />
                  </td>
                  <td hlmTd class="px-0">
                    <button hlmBtn variant="ghost" size="icon" class="size-6"
                      (click)="toggleExpand(o.id, $event)">
                      <ng-icon hlmIcon size="sm"
                        [name]="expandedIds().has(o.id) ? 'lucideChevronDown' : 'lucideChevronRight'" />
                    </button>
                  </td>
                  <td hlmTd class="text-xs">{{ formatDate(o.aprobadoEn) }}</td>
                  <td hlmTd class="font-mono text-xs">{{ o.numeroReferencia }}</td>
                  <td hlmTd class="font-mono text-xs">{{ o.ordenPrestamoReferencia }}</td>
                  <td hlmTd class="text-xs">{{ o.agenteNombre ?? '—' }}</td>
                  <td hlmTd class="text-xs">{{ o.unidadNombre ?? '—' }}</td>
                  <td hlmTd class="text-right tabular-nums">{{ o.numLineasDevueltas }}</td>
                </tr>
                @if (expandedIds().has(o.id)) {
                  <tr hlmTr>
                    <td hlmTd [attr.colspan]="100" class="p-0 border-t-0">
                      <div class="px-10 py-3 bg-muted/30 border-b border-border">
                        @if (loadingLines().has(o.id)) {
                          <div class="flex items-center justify-center py-4"><hlm-spinner /></div>
                        } @else if ((linesCache().get(o.id) ?? []).length === 0) {
                          <p class="text-xs text-muted-foreground italic py-2">Sin líneas registradas</p>
                        } @else {
                          <table class="w-full text-xs">
                            <thead>
                              <tr class="border-b border-border">
                                <th class="text-left font-normal py-1 pr-3 w-36">Tipo material</th>
                                <th class="text-left font-normal py-1 pr-3 w-32">Marca</th>
                                <th class="text-left font-normal py-1 pr-3">Modelo</th>
                                <th class="text-left font-normal py-1 pr-3 w-36 font-mono">N.º serie</th>
                                <th class="text-left font-normal py-1">Almacén</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (l of linesCache().get(o.id)!; track l.id) {
                                <tr class="border-b border-border/50 last:border-0">
                                  <td class="py-1 pr-3">{{ l.tipoMaterialNombre ?? '—' }}</td>
                                  <td class="py-1 pr-3">{{ l.marcaNombre ?? '—' }}</td>
                                  <td class="py-1 pr-3">{{ l.modeloDescripcion ?? '—' }}</td>
                                  <td class="py-1 pr-3 font-mono">{{ l.articuloSerialNumber ?? '—' }}</td>
                                  <td class="py-1">{{ l.almacenNombre ?? '—' }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        }
      </div>

      <!-- ── Paginación ────────────────────────────────────────────────────────── -->
      @if (!loading() && !error() && totalRecords() > 0) {
        <div [class]="footerCls">
          <span>{{ displayFrom() }}–{{ displayTo() }} / {{ totalRecords() }}</span>
          <div class="flex items-center gap-0.5">
            <select class="h-6 rounded border border-input bg-background px-1 text-xs focus:outline-none cursor-pointer"
              [value]="pageSize()" (change)="setPageSize(+$any($event.target).value)">
              @for (s of pageSizes; track s) { <option [value]="s">{{ s }}</option> }
            </select>
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() === 0" (click)="setPage(0)">
              <ng-icon hlmIcon size="sm" name="lucideChevronsLeft" />
            </button>
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() === 0" (click)="setPage(currentPage() - 1)">
              <ng-icon hlmIcon size="sm" name="lucideChevronLeft" />
            </button>
            @for (p of pageNumbers(); track p) {
              @if (p === '...') { <span class="px-1">…</span> }
              @else {
                <button hlmBtn [variant]="p === currentPage() + 1 ? 'default' : 'ghost'" size="icon" class="size-6 text-xs" (click)="setPage(+p - 1)">{{ p }}</button>
              }
            }
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() >= totalPages() - 1" (click)="setPage(currentPage() + 1)">
              <ng-icon hlmIcon size="sm" name="lucideChevronRight" />
            </button>
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() >= totalPages() - 1" (click)="setPage(totalPages() - 1)">
              <ng-icon hlmIcon size="sm" name="lucideChevronsRight" />
            </button>
          </div>
        </div>
      }

    </div>
  `,
})
export class ReturnsComponent extends GridBase<OrdenDevolucion> implements OnInit {
  protected override readonly gridId           = 'inventory-returns';
  protected override readonly labelSingular    = 'Devolución';
  protected override readonly labelPlural      = 'Devoluciones';
  protected override readonly icon             = 'lucidePackageCheck';
  protected override readonly colMetaTableName = 't600_ordenes_devolucion';

  private readonly router         = inject(Router);
  private readonly selectAllCbRef = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');

  readonly checkingNew   = signal(false);
  readonly newOrderError = signal<string | null>(null);

  readonly expandedIds  = signal(new Set<string>());
  readonly linesCache   = signal(new Map<string, LineaDevolucion[]>());
  readonly loadingLines = signal(new Set<string>());

  constructor() {
    super();
    effect(() => {
      const el = this.selectAllCbRef()?.nativeElement;
      if (el) el.indeterminate = this.someSelected();
    });
  }

  override ngOnInit(): void {
    this.loadGridPrefs();
    this.sortCriteria.set([{ field: 'aprobadoEn', dir: 'desc' }]);
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<OrdenDevolucion[]>(API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar las devoluciones'); this.loading.set(false); },
    });
  }

  toggleExpand(id: string, event: MouseEvent): void {
    event.stopPropagation();
    const next = new Set(this.expandedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      if (!this.linesCache().has(id)) this.fetchLines(id);
    }
    this.expandedIds.set(next);
  }

  private fetchLines(id: string): void {
    const loading = new Set(this.loadingLines());
    loading.add(id);
    this.loadingLines.set(loading);
    this.http.get<LineaDevolucion[]>(`${API}/${id}/lineas`).subscribe({
      next: lines => {
        const cmp = (a: string | null, b: string | null) =>
          (a ?? '').localeCompare(b ?? '', undefined, { sensitivity: 'base' });
        lines.sort((a, b) =>
          cmp(a.tipoMaterialNombre, b.tipoMaterialNombre) ||
          cmp(a.marcaNombre,        b.marcaNombre)        ||
          cmp(a.modeloDescripcion,  b.modeloDescripcion)  ||
          cmp(a.articuloSerialNumber, b.articuloSerialNumber)
        );
        const cache = new Map(this.linesCache());
        cache.set(id, lines);
        this.linesCache.set(cache);
        const l = new Set(this.loadingLines());
        l.delete(id);
        this.loadingLines.set(l);
      },
      error: () => {
        const l = new Set(this.loadingLines());
        l.delete(id);
        this.loadingLines.set(l);
      },
    });
  }

  goNew(): void {
    this.newOrderError.set(null);
    this.checkingNew.set(true);
    this.http.get<{ estadoActual: string | null }[]>(API_ARTICULOS).subscribe({
      next: data => {
        this.checkingNew.set(false);
        const hayPrestados = data.some(a => a.estadoActual === 'Prestado');
        if (!hayPrestados) {
          this.newOrderError.set('No hay artículos prestados. No es posible crear una devolución.');
        } else {
          this.router.navigate(['/inventory/orders/returns/new']);
        }
      },
      error: () => {
        this.checkingNew.set(false);
        this.newOrderError.set('Error al comprobar artículos prestados.');
      },
    });
  }

  goToDevolucion(o: OrdenDevolucion): void {
    this.router.navigate(
      ['/inventory/orders/loans', o.ordenPrestamoId, 'devolucion'],
      { queryParams: { devRef: o.numeroReferencia } }
    );
  }

  goLoan(o: OrdenDevolucion): void {
    this.router.navigate(['/inventory/orders/loans'], { queryParams: { ref: o.ordenPrestamoReferencia } });
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
