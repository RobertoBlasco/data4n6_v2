import {
  ChangeDetectionStrategy, Component, ElementRef,
  OnInit, effect, inject, signal, viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import {
  lucideHand,
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

const API = 'http://localhost:8080/api/v1/inventory/ordenes-devolucion';

interface OrdenDevolucion {
  id: string;
  numeroReferencia:        string;
  aprobadoEn:              string;
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
    lucideHand, lucidePlus,
    lucideRefreshCw, lucideDownload,
    lucideLayoutList, lucideSlidersHorizontal,
    lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideExternalLink,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0 overflow-hidden border-2 border-primary rounded-lg bg-background">

      <!-- ── Cabecera ──────────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">

        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            <ng-icon hlmIcon size="sm" name="lucideHand" />Devoluciones
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
              <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />Nueva orden
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
            <ng-icon hlmIcon size="lg" name="lucideHand" class="opacity-25" />
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
                >
                  <td hlmTd class="pr-0">
                    <input type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="selectedIds().has(o.id)"
                      (click)="toggleSelectRange(o.id, $index, $event)" />
                  </td>
                  <td hlmTd class="text-xs text-primary">{{ formatDate(o.aprobadoEn) }}</td>
                  <td hlmTd class="font-mono text-xs text-primary">{{ o.numeroReferencia }}</td>
                  <td hlmTd class="font-mono text-xs text-primary">{{ o.ordenPrestamoReferencia }}</td>
                  <td hlmTd class="text-xs text-primary">{{ o.agenteNombre ?? '—' }}</td>
                  <td hlmTd class="text-xs text-primary">{{ o.unidadNombre ?? '—' }}</td>
                  <td hlmTd class="text-right tabular-nums text-primary">{{ o.numLineasDevueltas }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- ── Paginación ────────────────────────────────────────────────────────── -->
      @if (!loading() && !error() && totalRecords() > 0) {
        <div class="flex items-center justify-between px-4 h-10 shrink-0 border-t border-border text-xs text-muted-foreground" [ngClass]="footerColor">
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
  protected override readonly gridId        = 'inventory-returns';
  protected override readonly labelSingular = 'Devolución';
  protected override readonly labelPlural   = 'Devoluciones';
  protected override readonly icon          = 'lucideHand';

  private readonly router         = inject(Router);
  private readonly selectAllCbRef = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');

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

  goNew(): void { this.router.navigate(['/inventory/orders/returns/new']); }

  goLoan(o: OrdenDevolucion): void {
    this.router.navigate(['/inventory/orders/loans'], { queryParams: { ref: o.ordenPrestamoReferencia } });
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
