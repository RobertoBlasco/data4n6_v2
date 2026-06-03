import {
  ChangeDetectionStrategy, Component, ElementRef, OnInit,
  computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePackage,
  lucideTrash2, lucideExternalLink,
  lucideRefreshCw, lucideDownload,
  lucideLayoutList, lucideLayoutGrid,
  lucideSlidersHorizontal, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { GridBase, GRID_VIEW, GridViewDef } from '../../../shared/grid/grid-base';
import { FkComboboxComponent } from '../../../shared/components/fk-combobox/fk-combobox.component';

interface Articulo {
  id: string;
  tipoMaterialId:     string | null;
  tipoMaterialNombre: string | null;
  brandId:            string | null;
  brandName:          string | null;
  almacenId:          string | null;
  almacenNombre:      string | null;
  modeloId:           string | null;
  modeloDescripcion:  string | null;
  serialNumber:       string | null;
  estadoActual:          string | null;
  descripcionEstado:     string | null;
  numMovimientos:        number;
  numPrestamos:          number;
  ultimoMovimiento:      string | null;
  ultimaOrdenId:         string | null;
  ultimaOrdenReferencia: string | null;
}

type DialogState = 'open' | 'closed' | null;

const ARTICULOS_API = 'http://localhost:8080/api/v1/inventory/articulos';

@Component({
  selector: 'app-items-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass, DatePipe,
    FormsModule,
    HlmButtonImports, HlmTableImports,
    HlmLabelImports, HlmInputImports,
    BrnDialogContent, HlmDialogImports,
    HlmSpinnerImports, HlmIconImports,
    FkComboboxComponent,
  ],
  providers: [provideIcons({
    lucidePackage,
    lucideTrash2, lucideExternalLink,
    lucideRefreshCw, lucideDownload,
    lucideLayoutList, lucideLayoutGrid,
    lucideSlidersHorizontal, lucideSearch, lucideX,
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
            <ng-icon hlmIcon size="sm" name="lucidePackage" />Artículos
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
                          <span class="text-[10px] text-muted-foreground font-normal">{{ view.description }}</span>
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
          </div>

        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            @if (selectionCount() === 1) {
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
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar por número de serie, categoría, marca..."
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
        <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30 space-y-2">
          <!-- Fila de filtros -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-muted-foreground whitespace-nowrap">Estado:</span>
            @for (estado of ESTADOS; track estado) {
              <button
                class="px-2.5 py-0.5 text-xs rounded-full border transition-colors"
                [class.bg-[#005a3b]]="filterEstados().has(estado)"
                [class.text-white]="filterEstados().has(estado)"
                [class.border-[#005a3b]]="filterEstados().has(estado)"
                [class.bg-transparent]="!filterEstados().has(estado)"
                [class.text-muted-foreground]="!filterEstados().has(estado)"
                [class.border-border]="!filterEstados().has(estado)"
                [class.hover:border-[#005a3b]]="!filterEstados().has(estado)"
                (click)="toggleFilterEstado(estado)">
                {{ estado }}
              </button>
            }
          </div>
          <!-- Chips activos -->
          @if (filterEstados().size > 0) {
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs text-muted-foreground">Activos:</span>
              @for (estado of filterEstados(); track estado) {
                <span class="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-[#005a3b] text-white">
                  {{ estado }}
                  <button (click)="removeFilterEstado(estado)" class="hover:opacity-70 transition-opacity">
                    <ng-icon hlmIcon size="xs" name="lucideX" />
                  </button>
                </span>
              }
              <button class="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                (click)="clearFilterEstados()">
                Limpiar todo
              </button>
            </div>
          }
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
        @if (!loading() && !error() && totalRecords() === 0 && !searchQuery() && filterEstados().size === 0) {
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <ng-icon hlmIcon size="lg" name="lucidePackage" class="opacity-25" />
            <p class="text-sm">No hay artículos registrados</p>
            <p class="text-xs">Los artículos se dan de alta mediante órdenes de entrada</p>
          </div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && (searchQuery() || filterEstados().size > 0)) {
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
            <p class="text-sm">Sin resultados para los filtros activos</p>
            <div class="flex gap-2">
              @if (searchQuery()) {
                <button hlmBtn variant="outline" size="sm" (click)="clearSearch()">Limpiar búsqueda</button>
              }
              @if (filterEstados().size > 0) {
                <button hlmBtn variant="outline" size="sm" (click)="clearFilterEstados()">Limpiar filtros</button>
              }
            </div>
          </div>
        }

        @if (!loading() && !error() && totalRecords() > 0) {

          @if (activeView().id === 'CARD') {
            <div class="grid gap-3 p-4" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
              @for (item of pageItems(); track item.id) {
                <div class="group flex flex-col rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
                  (dblclick)="goDetail(item)"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <input type="checkbox" class="accent-primary cursor-pointer shrink-0"
                      [checked]="selectedIds().has(item.id)"
                      (click)="toggleSelectRange(item.id, $index, $event)" />
                    <ng-icon hlmIcon name="lucidePackage" size="sm" class="text-primary shrink-0" />
                    <span class="text-sm leading-tight truncate">{{ item.serialNumber ?? '—' }}</span>
                  </div>
                  <div class="text-xs text-muted-foreground space-y-0.5 flex-1">
                    @if (item.tipoMaterialNombre) { <p>{{ item.tipoMaterialNombre }}</p> }
                    @if (item.brandName) { <p>{{ item.brandName }}@if (item.modeloDescripcion) { · {{ item.modeloDescripcion }} }</p> }
                    @if (item.almacenNombre) { <p>{{ item.almacenNombre }}</p> }
                  </div>
                </div>
              }
            </div>

          } @else {
            <table hlmTable class="w-full">
              <thead hlmTHead [ngClass]="headerColor">
                <tr hlmTr>
                  <th hlmTh class="w-8 pr-0">
                    <input #selectAllCb type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="allSelected()" (change)="toggleSelectAll()" />
                  </th>
                  @if (isColumnVisible('tipoMaterialNombre')) {
                  <th hlmTh [style.width.px]="colWidthPx('tipoMaterialNombre')" class="cursor-pointer select-none" (click)="toggleSort('tipoMaterialNombre', $event)">
                    <div class="flex items-center gap-1">{{ colLabel('tipoMaterialNombre', 'Tipo material') }}
                      @if (sortDir('tipoMaterialNombre') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('tipoMaterialNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  }
                  @if (isColumnVisible('brandName')) {
                  <th hlmTh [style.width.px]="colWidthPx('brandName')" class="cursor-pointer select-none" (click)="toggleSort('brandName', $event)">
                    <div class="flex items-center gap-1">{{ colLabel('brandName', 'Marca') }}
                      @if (sortDir('brandName') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('brandName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  }
                  @if (isColumnVisible('modeloDescripcion')) {
                  <th hlmTh [style.width.px]="colWidthPx('modeloDescripcion')" class="cursor-pointer select-none" (click)="toggleSort('modeloDescripcion', $event)">
                    <div class="flex items-center gap-1">{{ colLabel('modeloDescripcion', 'Modelo') }}
                      @if (sortDir('modeloDescripcion') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('modeloDescripcion') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  }
                  @if (isColumnVisible('serialNumber')) {
                  <th hlmTh [style.width.px]="colWidthPx('serialNumber')" class="cursor-pointer select-none" (click)="toggleSort('serialNumber', $event)">
                    <div class="flex items-center gap-1">{{ colLabel('serialNumber', 'N.º Serie') }}
                      @if (sortDir('serialNumber') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('serialNumber') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  }
                  @if (isColumnVisible('almacenNombre')) {
                  <th hlmTh [style.width.px]="colWidthPx('almacenNombre')" class="cursor-pointer select-none" (click)="toggleSort('almacenNombre', $event)">
                    <div class="flex items-center gap-1">{{ colLabel('almacenNombre', 'Almacén') }}
                      @if (sortDir('almacenNombre') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('almacenNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  }
                  @if (isColumnVisible('estadoActual')) {
                  <th hlmTh [style.width.px]="colWidthPx('estadoActual')" class="cursor-pointer select-none" (click)="toggleSort('estadoActual', $event)">
                    <div class="flex items-center gap-1">{{ colLabel('estadoActual', 'Estado') }}
                      @if (sortDir('estadoActual') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('estadoActual') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  }
                  <th hlmTh class="w-48 cursor-pointer select-none" (click)="toggleSort('descripcionEstado', $event)">
                    <div class="flex items-center gap-1">Desc. estado
                      @if (sortDir('descripcionEstado') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('descripcionEstado') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  <th hlmTh class="w-20 cursor-pointer select-none text-center" (click)="toggleSort('numPrestamos', $event)">
                    <div class="flex items-center justify-center gap-1">Nº Prést.
                      @if (sortDir('numPrestamos') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('numPrestamos') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  <th hlmTh class="w-16 cursor-pointer select-none text-center" (click)="toggleSort('numMovimientos', $event)">
                    <div class="flex items-center justify-center gap-1">Mov.
                      @if (sortDir('numMovimientos') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('numMovimientos') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  <th hlmTh class="w-28 cursor-pointer select-none text-center" (click)="toggleSort('ultimoMovimiento', $event)">
                    <div class="flex items-center justify-center gap-1">Últ. movimiento
                      @if (sortDir('ultimoMovimiento') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('ultimoMovimiento') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                  <th hlmTh class="w-32 cursor-pointer select-none" (click)="toggleSort('ultimaOrdenReferencia', $event)">
                    <div class="flex items-center gap-1">Última orden
                      @if (sortDir('ultimaOrdenReferencia') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir('ultimaOrdenReferencia') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody hlmTBody>
                @for (item of pageItems(); track item.id; let odd = $odd) {
                  <tr hlmTr
                    class="cursor-pointer"
                    [class.bg-action/25]="selectedIds().has(item.id)"
                    [ngClass]="[odd && !selectedIds().has(item.id) ? rowStripeClass : '', rowHoverClass]"
                    (dblclick)="goDetail(item)"
                  >
                    <td hlmTd class="pr-0">
                      <input type="checkbox" class="accent-primary cursor-pointer"
                        [checked]="selectedIds().has(item.id)"
                        (click)="toggleSelectRange(item.id, $index, $event)" />
                    </td>
                    @if (isColumnVisible('tipoMaterialNombre')) {
                    <td hlmTd class="text-muted-foreground">{{ item.tipoMaterialNombre ?? '—' }}</td>
                    }
                    @if (isColumnVisible('brandName')) {
                    <td hlmTd class="text-muted-foreground">{{ item.brandName ?? '—' }}</td>
                    }
                    @if (isColumnVisible('modeloDescripcion')) {
                    <td hlmTd class="text-muted-foreground">{{ item.modeloDescripcion ?? '—' }}</td>
                    }
                    @if (isColumnVisible('serialNumber')) {
                    <td hlmTd class="font-mono text-xs">{{ item.serialNumber ?? '—' }}</td>
                    }
                    @if (isColumnVisible('almacenNombre')) {
                    <td hlmTd class="text-muted-foreground">{{ item.almacenNombre ?? '—' }}</td>
                    }
                    @if (isColumnVisible('estadoActual')) {
                    <td hlmTd [ngClass]="estadoColorClass(item.estadoActual)">{{ item.estadoActual ?? '—' }}</td>
                    }
                    <td hlmTd class="text-xs text-muted-foreground">{{ item.descripcionEstado ?? '—' }}</td>
                    <td hlmTd class="text-xs text-center tabular-nums text-muted-foreground">{{ item.numPrestamos || '—' }}</td>
                    <td hlmTd class="text-xs text-center text-muted-foreground">{{ item.numMovimientos || '—' }}</td>
                    <td hlmTd class="text-xs text-center text-muted-foreground">{{ item.ultimoMovimiento ? (item.ultimoMovimiento | date:'dd/MM/yy') : '—' }}</td>
                    <td hlmTd class="font-mono text-xs text-muted-foreground">{{ item.ultimaOrdenReferencia ?? '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }

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

    <!-- ── Diálogo de alta ───────────────────────────────────────────────────── -->
    <hlm-dialog [state]="formState()" (stateChanged)="onFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-lg" [showCloseButton]="false">

          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-4 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucidePackage" />
            <h2 class="text-sm font-semibold">Nuevo artículo</h2>
          </div>

          @if (formError()) {
            <div class="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {{ formError() }}
            </div>
          }

          <div class="space-y-4">

            <div class="space-y-1.5">
              <label hlmLabel for="dSerial">N.º de serie</label>
              <input hlmInput id="dSerial" class="w-full" placeholder="Ej. SN-20240001"
                [ngModel]="dSerialNumber()"
                (ngModelChange)="dSerialNumber.set($event)" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label hlmLabel>Tipo de material</label>
                <app-fk-combobox
                  endpoint="/api/v1/inventory/tipos-material"
                  [value]="dTipoMaterialId()"
                  (valueChange)="dTipoMaterialId.set($event)" />
              </div>
              <div class="space-y-1.5">
                <label hlmLabel>Marca</label>
                <app-fk-combobox
                  endpoint="/api/v1/inventory/marcas"
                  [value]="dBrandId()"
                  (valueChange)="onFormBrandChange($event)" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label hlmLabel>Modelo</label>
                <app-fk-combobox
                  [endpoint]="dModeloEndpoint()"
                  [value]="dModeloId()"
                  (valueChange)="dModeloId.set($event)" />
              </div>
              <div class="space-y-1.5">
                <label hlmLabel>Almacén</label>
                <app-fk-combobox
                  endpoint="/api/v1/inventory/almacenes"
                  [value]="dAlmacenId()"
                  (valueChange)="dAlmacenId.set($event)" />
              </div>
            </div>

          </div>

          <div hlmDialogFooter class="gap-2 mt-4">
            <button hlmBtn variant="outline"
              class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white"
              hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline"
              class="border-primary text-primary hover:bg-primary/10"
              [disabled]="formSaving()"
              (click)="saveFormAndNext()">
              @if (formSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta+Siguiente
            </button>
            <button hlmBtn variant="outline"
              [disabled]="formSaving()"
              (click)="saveFormAndNavigate()">
              @if (formSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta+Formulario
            </button>
            <button hlmBtn
              [disabled]="formSaving()"
              (click)="saveForm()">
              @if (formSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta
            </button>
          </div>

        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- ── Confirmar borrar ──────────────────────────────────────────────────── -->
    <hlm-dialog [state]="deleteState()" (stateChanged)="onDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucidePackage" />
            <h2 class="text-sm font-semibold">¿Eliminar artículo?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">
            @if (itemToDelete()) {
              Se eliminará el artículo
              @if (itemToDelete()?.serialNumber) {
                con N.º de serie <strong>{{ itemToDelete()!.serialNumber }}</strong>
              } @else {
                seleccionado
              }.
            } @else {
              Se eliminarán <strong>{{ selectionCount() }}</strong> artículos seleccionados.
            }
            Esta acción no se puede deshacer.
          </p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="destructive" (click)="confirmDelete()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class ItemsListComponent extends GridBase<Articulo> implements OnInit {
  protected override readonly gridId        = 'inventory-items';
  protected override readonly labelSingular = 'Artículo';
  protected override readonly labelPlural   = 'Artículos';
  protected override readonly icon          = 'lucidePackage';
  protected override readonly gridViews: GridViewDef[] = [GRID_VIEW.GRID, GRID_VIEW.CARD];
  protected override readonly colMetaTableName = 't100_articulos';

  private readonly router = inject(Router);

  // ── Estado filter ─────────────────────────────────────────────────────────
  readonly ESTADOS = ['Almacén', 'Prestado', 'Adjudicado', 'Baja', 'En reparación'] as const;
  readonly filterEstados = signal<Set<string>>(new Set());

  override readonly filteredItems = computed(() => {
    const q      = this.searchQuery().toLowerCase().trim();
    const estados = this.filterEstados();
    let items    = this.allItems();
    if (q) {
      items = items.filter(item =>
        Object.values(item as unknown as Record<string, unknown>).some(
          v => typeof v === 'string' && v.toLowerCase().includes(q)
        )
      );
    }
    if (estados.size > 0) {
      items = items.filter(item => estados.has(item.estadoActual ?? ''));
    }
    const criteria = this.sortCriteria();
    if (criteria.length) {
      items = [...items].sort((a, b) => {
        for (const { field, dir } of criteria) {
          const av = String((a as unknown as Record<string, unknown>)[field] ?? '');
          const bv = String((b as unknown as Record<string, unknown>)[field] ?? '');
          const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
          if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }
    return items;
  });

  toggleFilterEstado(estado: string): void {
    const next = new Set(this.filterEstados());
    next.has(estado) ? next.delete(estado) : next.add(estado);
    this.filterEstados.set(next);
    this.currentPage.set(0);
  }

  removeFilterEstado(estado: string): void {
    const next = new Set(this.filterEstados());
    next.delete(estado);
    this.filterEstados.set(next);
    this.currentPage.set(0);
  }

  clearFilterEstados(): void {
    this.filterEstados.set(new Set());
    this.currentPage.set(0);
  }

  private readonly selectAllCbRef = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');

  // Delete dialog
  readonly itemToDelete = signal<Articulo | null>(null);
  readonly deleteState  = signal<DialogState>(null);

  // Create dialog state
  readonly formState  = signal<DialogState>(null);
  readonly formSaving = signal(false);
  readonly formError  = signal<string | null>(null);

  // Create dialog fields
  readonly dSerialNumber   = signal('');
  readonly dTipoMaterialId = signal('');
  readonly dBrandId        = signal('');
  readonly dModeloId       = signal('');
  readonly dAlmacenId      = signal('');

  readonly dModeloEndpoint = computed(() =>
    this.dBrandId()
      ? `/api/v1/inventory/modelos?marcaId=${this.dBrandId()}`
      : '/api/v1/inventory/modelos'
  );

  constructor() {
    super();
    effect(() => {
      const el = this.selectAllCbRef()?.nativeElement;
      if (el) el.indeterminate = this.someSelected();
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.sortCriteria.set([
      { field: 'tipoMaterialNombre', dir: 'asc' },
      { field: 'brandName',          dir: 'asc' },
      { field: 'modeloDescripcion',  dir: 'asc' },
      { field: 'serialNumber',       dir: 'asc' },
    ]);
    this.loadGridPrefs();
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Articulo[]>(ARTICULOS_API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar los artículos. Comprueba la conexión con el servidor.'); this.loading.set(false); },
    });
  }

  goDetail(item: Articulo): void { this.router.navigate(['/inventory/items', item.id]); }

  estadoColorClass(estado: string | null): string {
    if (!estado) return 'text-muted-foreground';
    const e = estado.toLowerCase();
    if (e.includes('entrada'))  return 'text-green-700';
    if (e.includes('préstamo') || e.includes('prestamo')) return 'text-blue-600';
    if (e.includes('traspaso')) return 'text-purple-600';
    if (e.includes('baja'))     return 'text-red-600';
    if (e.includes('adjudic'))  return 'text-orange-600';
    if (e.includes('devolu'))   return 'text-teal-600';
    return 'text-muted-foreground';
  }

  // ── Create dialog ────────────────────────────────────────────────────────────

  onFormStateChanged(s: string): void { if (s === 'closed') this.formState.set(null); }

  onFormBrandChange(id: string): void {
    this.dBrandId.set(id);
    this.dModeloId.set('');
  }

  private doCreate(onSuccess: (saved: Articulo) => void): void {
    this.formSaving.set(true);
    this.formError.set(null);
    const body = {
      serialNumber:   this.dSerialNumber().trim() || null,
      tipoMaterialId: this.dTipoMaterialId() || null,
      brandId:        this.dBrandId()        || null,
      modeloId:       this.dModeloId()       || null,
      almacenId:      this.dAlmacenId()      || null,
    };
    this.http.post<Articulo>(ARTICULOS_API, body).subscribe({
      next:  saved => { this.formSaving.set(false); onSuccess(saved); },
      error: ()    => { this.formSaving.set(false); this.formError.set('Error al crear el artículo. Inténtalo de nuevo.'); },
    });
  }

  saveForm(): void {
    this.doCreate(() => { this.formState.set('closed'); this.clearSelection(); this.load(); });
  }

  saveFormAndNext(): void {
    this.doCreate(() => {
      this.load();
      this.dSerialNumber.set('');
      this.dTipoMaterialId.set('');
      this.dBrandId.set('');
      this.dModeloId.set('');
      this.dAlmacenId.set('');
    });
  }

  saveFormAndNavigate(): void {
    this.doCreate(saved => {
      this.formState.set('closed');
      this.clearSelection();
      this.load();
      this.router.navigate(['/inventory/items', saved.id]);
    });
  }

  // ── Delete dialog ────────────────────────────────────────────────────────────

  openDelete(item: Articulo | null): void {
    this.itemToDelete.set(item);
    this.deleteState.set('open');
  }

  onDeleteStateChanged(s: string): void { if (s === 'closed') this.deleteState.set(null); }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (item) {
      this.http.delete(`${ARTICULOS_API}/${item.id}`).subscribe({
        next:  () => { this.deleteState.set('closed'); this.clearSelection(); this.load(); },
        error: () => { this.deleteState.set('closed'); this.error.set('Error al eliminar el artículo.'); },
      });
    } else {
      forkJoin([...this.selectedIds()].map(id => this.http.delete(`${ARTICULOS_API}/${id}`))).subscribe({
        next:  () => { this.deleteState.set('closed'); this.clearSelection(); this.load(); },
        error: () => { this.deleteState.set('closed'); this.error.set('Error al eliminar los artículos.'); this.load(); },
      });
    }
  }
}
