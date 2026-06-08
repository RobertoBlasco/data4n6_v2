import {
  ChangeDetectionStrategy, Component, ElementRef,
  OnInit, effect, inject, signal, viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowDownToLine,
  lucidePencil, lucidePlus, lucideExternalLink,
  lucideRefreshCw, lucideDownload,
  lucideLayoutList, lucideSlidersHorizontal,
  lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { GridBase } from '../../../../shared/grid/grid-base';

interface LineaEntrada {
  id: string;
  marcaId:             string | null;
  marcaNombre:         string | null;
  modeloId:            string | null;
  modeloDescripcion:   string | null;
  numeroSerie:         string | null;
  tipoMaterialId:      string | null;
  tipoMaterialNombre:  string | null;
  almacenId:           string | null;
  almacenNombre:       string | null;
}

interface OrdenEntrada {
  id: string;
  numeroReferencia:            string;
  aprobadoPor:                 string | null;
  aprobadoEn:                  string;
  createdAt:                   string;
  tipoEntradaId:               string;
  tipoEntradaNombre:           string;
  tipoEntradaDescripcionCorta: string | null;
  estadoOrdenId:               string | null;
  estadoOrdenNombre:           string | null;
  numLineas:                   number;
}

const API = 'http://localhost:8080/api/v1/inventory/ordenes-entrada';

@Component({
  selector: 'app-warehouse-entries',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    HlmButtonImports, HlmTableImports,
    HlmSpinnerImports, HlmIconImports,
  ],
  providers: [provideIcons({
    lucideArrowDownToLine,
    lucidePencil, lucidePlus, lucideExternalLink,
    lucideRefreshCw, lucideDownload,
    lucideLayoutList, lucideSlidersHorizontal,
    lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0 overflow-hidden border-2 border-primary rounded-lg bg-background">

      <!-- ── Cabecera ──────────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">

        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            <ng-icon hlmIcon size="sm" name="lucideArrowDownToLine" />{{ gridTitle() }}
          </h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Recargar" (click)="reload()">
              <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
            </button>
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Exportar">
              <ng-icon hlmIcon size="sm" name="lucideDownload" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Columnas">
              <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
            </button>
            <div class="relative">
              <button hlmBtn variant="ghost" size="icon"
                class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                [class.bg-primary-foreground/20]="showViewPicker()"
                title="Cambiar vista"
                (click)="toggleViewPicker()"
              >
                <ng-icon hlmIcon size="sm" [name]="activeView().icon" />
              </button>
              @if (showViewPicker()) {
                <div class="fixed inset-0 z-40" (click)="showViewPicker.set(false)"></div>
                <div class="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
                  @for (view of gridViews; track view.id) {
                    <button class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                      [class.font-semibold]="activeView().id === view.id"
                      (click)="setView(view)">
                      <ng-icon hlmIcon size="sm" [name]="view.icon" class="shrink-0" />
                      <span class="flex flex-col">
                        <span>{{ view.label }}</span>
                        @if (view.description) {
                          <span class="text-[10px] font-normal">{{ view.description }}</span>
                        }
                      </span>
                    </button>
                  }
                </div>
              }
            </div>
            <button hlmBtn variant="ghost" size="icon"
              class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
              [class.bg-primary-foreground/20]="showAdvancedFilters()"
              title="Filtros avanzados"
              (click)="showAdvancedFilters.set(!showAdvancedFilters())"
            >
              <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="action" size="sm" class="h-7" (click)="goNew()">
              <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />
              Nueva Entrada
            </button>
          </div>

        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionada{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            @if (selectionCount() === 1) {
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                (click)="goEdit(singleSelected()!)">
                <ng-icon hlmIcon size="sm" name="lucidePencil" class="mr-1" />Editar
              </button>
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                (click)="goDetail(singleSelected()!)">
                <ng-icon hlmIcon size="sm" name="lucideExternalLink" class="mr-1" />Ir formulario
              </button>
            }
            <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground">
              <ng-icon hlmIcon size="sm" name="lucideDownload" class="mr-1" />Exportar
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Deseleccionar" (click)="clearSelection()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          </div>
        }

      </div>

      <!-- ── Buscador ──────────────────────────────────────────────────────────── -->
      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar por referencia, tipo, estado..."
            [value]="searchInput()"
            (input)="onSearchInput($any($event.target).value)"
          />
          @if (searchInput()) {
            <button class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground" (click)="clearSearch()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          }
        </div>
      </div>

      <!-- ── Filtros avanzados ──────────────────────────────────────────────────── -->
      @if (showAdvancedFilters()) {
        <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
          <p class="text-xs italic">Sin filtros avanzados configurados</p>
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
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <ng-icon hlmIcon size="lg" name="lucideArrowDownToLine" class="opacity-25" />
            <p class="text-sm">No hay entradas de almacén registradas</p>
            <button hlmBtn variant="outline" size="sm" (click)="goNew()">
              <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Nueva entrada
            </button>
          </div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && searchQuery()) {
          <div class="flex flex-col items-center justify-center py-12 gap-3">
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
                    @if (sortDir('aprobadoEn') === 'asc')   { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('aprobadoEn') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-36 cursor-pointer select-none" (click)="toggleSort('tipoEntradaNombre', $event)">
                  <div class="flex items-center gap-1">Tipo entrada
                    @if (sortDir('tipoEntradaNombre') === 'asc')   { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('tipoEntradaNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-36 cursor-pointer select-none" (click)="toggleSort('numeroReferencia', $event)">
                  <div class="flex items-center gap-1">Referencia
                    @if (sortDir('numeroReferencia') === 'asc')   { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('numeroReferencia') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-24 cursor-pointer select-none text-right" (click)="toggleSort('numLineas', $event)">
                  <div class="flex items-center justify-end gap-1">Materiales
                    @if (sortDir('numLineas') === 'asc')   { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('numLineas') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-32 cursor-pointer select-none" (click)="toggleSort('estadoOrdenNombre', $event)">
                  <div class="flex items-center gap-1">Estado
                    @if (sortDir('estadoOrdenNombre') === 'asc')   { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('estadoOrdenNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('aprobadoPor', $event)">
                  <div class="flex items-center gap-1">Aprobado por
                    @if (sortDir('aprobadoPor') === 'asc')   { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('aprobadoPor') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
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
                  (dblclick)="goEdit(o)"
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
                  <td hlmTd>
                    <span class="flex items-center gap-1.5">
                      @if (o.tipoEntradaDescripcionCorta) {
                        <span class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {{ o.tipoEntradaDescripcionCorta }}
                        </span>
                      }
                      {{ o.tipoEntradaNombre }}
                    </span>
                  </td>
                  <td hlmTd class="font-mono text-xs">{{ o.numeroReferencia }}</td>
                  <td hlmTd class="text-right tabular-nums">{{ o.numLineas }}</td>
                  <td hlmTd [ngClass]="estadoColorClass(o.estadoOrdenNombre)">{{ o.estadoOrdenNombre ?? '—' }}</td>
                  <td hlmTd>{{ o.aprobadoPor ?? '—' }}</td>
                </tr>
                @if (expandedIds().has(o.id)) {
                  <tr hlmTr>
                    <td hlmTd [attr.colspan]="100" class="p-0 border-t-0">
                      <div class="px-10 py-3 bg-muted/30 border-b border-border">
                        @if (loadingLines().has(o.id)) {
                          <div class="flex items-center justify-center py-4"><hlm-spinner /></div>
                        } @else if ((linesCache().get(o.id) ?? []).length === 0) {
                          <p class="text-xs italic py-2">Sin líneas registradas</p>
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
                                  <td class="py-1 pr-3 font-mono">{{ l.numeroSerie ?? '—' }}</td>
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
        <div class="flex items-center justify-between px-4 h-10 shrink-0 border-t border-border text-xs" [ngClass]="footerColor">
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
export class WarehouseEntriesComponent extends GridBase<OrdenEntrada> implements OnInit {
  protected override readonly gridId           = 'inventory-warehouse-entries';
  protected override readonly labelSingular    = 'Entrada';
  protected override readonly labelPlural      = 'Entradas Almacén';
  protected override readonly icon             = 'lucideArrowDownToLine';
  protected override readonly colMetaTableName = 't600_ordenes_entrada';

  private readonly router         = inject(Router);
  private readonly selectAllCbRef = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');

  readonly expandedIds   = signal(new Set<string>());
  readonly linesCache    = signal(new Map<string, LineaEntrada[]>());
  readonly loadingLines  = signal(new Set<string>());

  constructor() {
    super();
    effect(() => {
      const el = this.selectAllCbRef()?.nativeElement;
      if (el) el.indeterminate = this.someSelected();
    });
  }

  override ngOnInit(): void {
    this.loadGridPrefs();
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<OrdenEntrada[]>(API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar las entradas de almacén'); this.loading.set(false); },
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
    this.http.get<LineaEntrada[]>(`${API}/${id}/lineas`).subscribe({
      next: lines => {
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

  goNew():                      void { this.router.navigate(['/inventory/orders/warehouse-entries/new']); }
  goEdit(o: OrdenEntrada):      void { this.router.navigate(['/inventory/orders/warehouse-entries', o.id, 'edit']); }
  goDetail(o: OrdenEntrada):    void { this.router.navigate(['/inventory/orders/warehouse-entries', o.id]); }

  estadoColorClass(estado: string | null): string {
    if (!estado) return '';
    const e = estado.toLowerCase();
    if (e.includes('complet') || e.includes('cerrad')) return 'text-green-700';
    if (e.includes('pend'))                             return 'text-yellow-600';
    if (e.includes('cancel') || e.includes('anulad'))  return 'text-red-600';
    return '';
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
