import {
  ChangeDetectionStrategy, Component, ElementRef, NgZone, OnInit,
  computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { DOCUMENT, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePencil, lucideTrash2, lucidePlus, lucideTag, lucideCpu,
  lucideRefreshCw, lucideDownload, lucideUpload,
  lucideLayoutList, lucideLayoutGrid, lucideTable2,
  lucideSlidersHorizontal, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '../../../spartan/tooltip/src';
import { GridBase, GridViewDef, GRID_VIEW } from '../../../shared/grid/grid-base';

interface Brand { id: string; name: string; description: string | null; }
interface BrandRequest { name: string; description: string | null; }
interface Modelo { id: string; tipoMaterialId: string; tipoMaterialNombre: string; marcaId: string; marcaNombre: string; description: string | null; }
interface ModeloRequest { tipoMaterialId: string; marcaId: string; description: string | null; }
interface TipoMaterial { id: string; name: string; }

const BRANDS_API    = 'http://localhost:8080/api/v1/inventory/brands';
const MODELOS_API   = 'http://localhost:8080/api/v1/inventory/modelos';
const TIPOS_MAT_API = 'http://localhost:8080/api/v1/inventory/tipos-material';
type DialogState = 'open' | 'closed' | null;

const MODEL_VIEWS = [
  { id: 'GRID', label: 'Tabla',    icon: 'lucideLayoutList', description: 'Vista compacta en tabla' },
  { id: 'CARD', label: 'Tarjetas', icon: 'lucideLayoutGrid', description: 'Vista en tarjetas' },
] as const;
type ModelViewId = typeof MODEL_VIEWS[number]['id'];

@Component({
  selector: 'app-brands',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgClass,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmTableImports, BrnDialogContent, HlmDialogImports,
    HlmSpinnerImports, HlmIconImports, HlmTooltipImports,
  ],
  providers: [provideIcons({
    lucidePencil, lucideTrash2, lucidePlus, lucideTag, lucideCpu,
    lucideRefreshCw, lucideDownload, lucideUpload,
    lucideLayoutList, lucideLayoutGrid, lucideTable2,
    lucideSlidersHorizontal, lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0 gap-0 overflow-hidden" #splitContainer>

      <!-- ── Panel superior: Marcas ─────────────────────────────────────────── -->
      <div class="flex flex-col min-h-0 rounded-t-lg border-2 border-primary bg-background overflow-hidden"
           [style.height.%]="topPanelPct()">

        <!-- Cabecera -->
        <div [class]="toolbarCls">

          @if (selectionCount() === 0) {
            <h1 class="text-sm font-semibold flex items-center gap-1.5">
              <ng-icon hlmIcon size="sm" name="lucideTag" />{{ gridTitle() }}
            </h1>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Recargar" (click)="reload()">
                <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
              </button>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Exportar">
                <ng-icon hlmIcon size="sm" name="lucideDownload" />
              </button>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Importar">
                <ng-icon hlmIcon size="sm" name="lucideUpload" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Columnas">
                <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
              </button>
              <div class="relative">
                <button hlmBtn variant="ghost" size="icon"
                  [class]="btnNewCls"
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
                [class]="btnNewCls"
                [class.bg-primary-foreground/20]="showAdvancedFilters()"
                title="Filtros avanzados"
                (click)="showAdvancedFilters.set(!showAdvancedFilters())"
              >
                <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Nueva Marca" (click)="openCreateBrand()">
              <ng-icon hlmIcon size="sm" name="lucidePlus" />
            </button>
            </div>

          } @else {
            <span class="text-sm">{{ selectionCount() }} seleccionada{{ selectionCount() !== 1 ? 's' : '' }}</span>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15"
                (click)="singleSelected() && openDeleteBrand(singleSelected()!)">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
              </button>
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

        <!-- Buscador -->
        <div class="px-3 py-2 shrink-0 border-b border-border">
          <div class="relative">
            <ng-icon hlmIcon size="sm" name="lucideSearch"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Buscar en marcas..."
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

        <!-- Filtros avanzados -->
        @if (showAdvancedFilters()) {
          <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
            <p class="text-xs italic">Sin filtros avanzados para esta rejilla</p>
          </div>
        }

        <!-- Tabla / Tarjetas -->
        <div class="flex-1 overflow-auto min-h-0">
          @if (loading()) {
            <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
          }
          @if (error() && !loading()) {
            <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
          }
          @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <ng-icon hlmIcon size="lg" name="lucideTag" class="opacity-25" />
              <p class="text-sm">No hay marcas registradas</p>
              <button hlmBtn variant="outline" size="sm" (click)="openCreateBrand()">
                <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primera marca
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

            @if (activeView().id === 'CARD') {
              <div class="grid gap-3 p-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">
                @for (brand of pageItems(); track brand.id) {
                  <div class="group flex flex-col rounded-lg border bg-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                    [class.border-primary]="selectedBrand()?.id === brand.id"
                    (click)="selectBrand(brand)"
                  >
                    <div class="flex items-center gap-2 mb-2">
                      <input type="checkbox" class="accent-primary cursor-pointer shrink-0"
                        [checked]="selectedIds().has(brand.id)"
                        (click)="$event.stopPropagation()"
                        (change)="toggleSelect(brand.id)" />
                      <ng-icon hlmIcon name="lucideTag" size="sm" class="text-primary shrink-0" />
                      <span class="text-sm leading-tight truncate">{{ brand.name }}</span>
                    </div>
                    @if (brand.description) {
                      <p class="text-xs line-clamp-2 flex-1">{{ brand.description }}</p>
                    } @else {
                      <p class="text-xs italic flex-1">Sin descripción</p>
                    }
                    <div class="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      (click)="$event.stopPropagation()">
                      <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEditBrand(brand)">
                        <ng-icon hlmIcon size="sm" name="lucidePencil" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteBrand(brand)">
                        <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                      </button>
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
                    <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('name', $event)">
                      <div class="flex items-center gap-1">Nombre
                        @if (sortDir('name') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                        @else if (sortDir('name') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                      </div>
                    </th>
                    <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('description', $event)">
                      <div class="flex items-center gap-1">Descripción
                        @if (sortDir('description') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                        @else if (sortDir('description') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                      </div>
                    </th>
                    <th hlmTh class="w-16 text-right">Acc.</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (brand of pageItems(); track brand.id; let odd = $odd) {
                    <tr hlmTr
                      class="cursor-pointer"
                      [class.bg-primary/15]="selectedBrand()?.id === brand.id"
                      [ngClass]="selectedBrand()?.id === brand.id ? '' : [odd ? rowStripeClass : '', rowHoverClass]"
                      (click)="selectBrand(brand)"
                    >
                      <td hlmTd class="pr-0" (click)="$event.stopPropagation()">
                        <input type="checkbox" class="accent-primary cursor-pointer"
                          [checked]="selectedIds().has(brand.id)"
                          (change)="toggleSelect(brand.id)" />
                      </td>
                      <td hlmTd>{{ brand.name }}</td>
                      <td hlmTd>{{ brand.description ?? '—' }}</td>
                      <td hlmTd class="text-right">
                        <div class="flex items-center justify-end gap-0.5" (click)="$event.stopPropagation()">
                          <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEditBrand(brand)">
                            <ng-icon hlmIcon size="sm" name="lucidePencil" />
                          </button>
                          <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteBrand(brand)">
                            <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }

          }
        </div>

        <!-- Paginación -->
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

      <!-- ── Divisor redimensionable ─────────────────────────────────────────── -->
      <div class="h-1.5 shrink-0 bg-action/60 hover:bg-action cursor-row-resize transition-colors"
           (mousedown)="onDividerMouseDown($event)"></div>

      <!-- ── Panel inferior: Modelos ─────────────────────────────────────────── -->
      <div class="flex flex-col min-h-0 rounded-b-lg border-2 border-primary bg-background overflow-hidden flex-1">

        <!-- Cabecera -->
        <div [class]="toolbarCls">

          @if (modelSelectionCount() === 0) {
            <h2 class="text-sm font-semibold flex items-center gap-1.5">
              <ng-icon hlmIcon size="sm" name="lucideCpu" />Modelos@if (selectedBrand()) {&nbsp;— {{ selectedBrand()!.name }}}
            </h2>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Recargar" [disabled]="!selectedBrand()" (click)="reloadModelos()">
                <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
              </button>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Exportar" [disabled]="!selectedBrand()">
                <ng-icon hlmIcon size="sm" name="lucideDownload" />
              </button>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Importar" [disabled]="!selectedBrand()">
                <ng-icon hlmIcon size="sm" name="lucideUpload" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Columnas" [disabled]="!selectedBrand()">
                <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
              </button>
              <div class="relative">
                <button hlmBtn variant="ghost" size="icon"
                  [class]="btnNewCls"
                  [class.bg-primary-foreground/20]="showModelViewPicker()"
                  title="Cambiar vista"
                  [disabled]="!selectedBrand()"
                  (click)="showModelViewPicker.set(!showModelViewPicker())"
                >
                  <ng-icon hlmIcon size="sm" [name]="modelViewIcon()" />
                </button>
                @if (showModelViewPicker()) {
                  <div class="fixed inset-0 z-40" (click)="showModelViewPicker.set(false)"></div>
                  <div class="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
                    @for (v of modelViews; track v.id) {
                      <button class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                        [class.font-semibold]="modelView() === v.id"
                        (click)="setModelView(v.id); showModelViewPicker.set(false)">
                        <ng-icon hlmIcon size="sm" [name]="v.icon" class="shrink-0" />
                        <span class="flex flex-col">
                          <span>{{ v.label }}</span>
                          @if (v.description) {
                            <span class="text-[10px] font-normal">{{ v.description }}</span>
                          }
                        </span>
                      </button>
                    }
                  </div>
                }
              </div>
              <button hlmBtn variant="ghost" size="icon"
                [class]="btnNewCls"
                [class.bg-primary-foreground/20]="showModelFilters()"
                title="Filtros avanzados"
                [disabled]="!selectedBrand()"
                (click)="showModelFilters.set(!showModelFilters())"
              >
                <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Nuevo Modelo" [disabled]="!selectedBrand()" (click)="openCreateModelo()">
              <ng-icon hlmIcon size="sm" name="lucidePlus" />
            </button>
            </div>

          } @else {
            <span class="text-sm">{{ modelSelectionCount() }} seleccionado{{ modelSelectionCount() !== 1 ? 's' : '' }}</span>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
              </button>
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground">
                <ng-icon hlmIcon size="sm" name="lucideDownload" class="mr-1" />Exportar
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Deseleccionar" (click)="clearModelSelection()">
                <ng-icon hlmIcon size="sm" name="lucideX" />
              </button>
            </div>
          }


        </div>

        <!-- Buscador modelos -->
        @if (selectedBrand()) {
          <div class="px-3 py-2 shrink-0 border-b border-border">
            <div class="relative">
              <ng-icon hlmIcon size="sm" name="lucideSearch"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Buscar en modelos..."
                [value]="modelSearchInput()"
                (input)="modelSearchInput.set($any($event.target).value)"
              />
              @if (modelSearchInput()) {
                <button class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground" (click)="modelSearchInput.set('')">
                  <ng-icon hlmIcon size="sm" name="lucideX" />
                </button>
              }
            </div>
          </div>

          <!-- Filtros avanzados modelos -->
          @if (showModelFilters()) {
            <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30 flex flex-wrap gap-3">
              <div class="flex items-center gap-2">
                <label class="text-xs shrink-0">Tipo de material</label>
                <select
                  class="h-7 rounded border border-primary bg-action/5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  [ngModel]="filterModelTipoMaterialId()" (ngModelChange)="filterModelTipoMaterialId.set($event)"
                >
                  <option value="">Todos</option>
                  @for (t of tiposMaterial(); track t.id) {
                    <option [value]="t.id">{{ t.name }}</option>
                  }
                </select>
              </div>
            </div>
          }
        }

        <!-- Contenido modelos -->
        <div class="flex-1 overflow-auto min-h-0">
          @if (!selectedBrand()) {
            <div class="flex flex-col items-center justify-center h-full gap-2">
              <ng-icon hlmIcon size="lg" name="lucideCpu" class="opacity-20" />
              <p class="text-sm">Selecciona una marca para ver sus modelos</p>
            </div>
          } @else if (loadingModelos()) {
            <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
          } @else if (modelosError()) {
            <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ modelosError() }}</div>
          } @else if (filteredModelos().length === 0 && !modelSearchInput() && !filterModelTipoMaterialId()) {
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <ng-icon hlmIcon size="lg" name="lucideCpu" class="opacity-25" />
              <p class="text-sm">No hay modelos para esta marca</p>
              <button hlmBtn variant="outline" size="sm" (click)="openCreateModelo()">
                <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primer modelo
              </button>
            </div>
          } @else if (filteredModelos().length === 0) {
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
              <p class="text-sm">Sin resultados</p>
              <button hlmBtn variant="outline" size="sm" (click)="modelSearchInput.set(''); filterModelTipoMaterialId.set('')">Limpiar filtros</button>
            </div>
          } @else if (modelView() === 'CARD') {
            <div class="grid gap-3 p-4" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))">
              @for (modelo of filteredModelos(); track modelo.id) {
                <div class="group flex flex-col rounded-lg border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all">
                  <div class="flex items-start gap-1.5 mb-1.5">
                    <input type="checkbox" class="accent-primary cursor-pointer shrink-0 mt-0.5"
                      [checked]="modelSelectedIds().has(modelo.id)"
                      (change)="toggleModelSelect(modelo.id)" />
                    <ng-icon hlmIcon name="lucideCpu" size="sm" class="text-primary shrink-0 mt-0.5" />
                    <span class="text-xs leading-tight truncate">{{ modelo.description ?? '—' }}</span>
                  </div>
                  <span class="text-[10px]">{{ modelo.tipoMaterialNombre }}</span>
                  <div class="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button hlmBtn variant="ghost" size="icon" class="size-5" title="Editar" (click)="openEditModelo(modelo)">
                      <ng-icon hlmIcon size="sm" name="lucidePencil" />
                    </button>
                    <button hlmBtn variant="ghost" size="icon" class="size-5 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteModelo(modelo)">
                      <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <table hlmTable class="w-full">
              <thead hlmTHead [ngClass]="headerColor">
                <tr hlmTr>
                  <th hlmTh class="w-8 pr-0">
                    <input #selectAllModelCb type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="modelAllSelected()" (change)="toggleModelSelectAll()" />
                  </th>
                  <th hlmTh>Tipo de material</th>
                  <th hlmTh>Descripción</th>
                  <th hlmTh class="w-16 text-right">Acc.</th>
                </tr>
              </thead>
              <tbody hlmTBody>
                @for (modelo of filteredModelos(); track modelo.id; let odd = $odd) {
                  <tr hlmTr [ngClass]="[rowHoverClass, odd ? rowStripeClass : '']">
                    <td hlmTd class="pr-0">
                      <input type="checkbox" class="accent-primary cursor-pointer"
                        [checked]="modelSelectedIds().has(modelo.id)"
                        (change)="toggleModelSelect(modelo.id)" />
                    </td>
                    <td hlmTd>{{ modelo.tipoMaterialNombre }}</td>
                    <td hlmTd>{{ modelo.description ?? '—' }}</td>
                    <td hlmTd class="text-right">
                      <div class="flex items-center justify-end gap-0.5">
                        <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEditModelo(modelo)">
                          <ng-icon hlmIcon size="sm" name="lucidePencil" />
                        </button>
                        <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteModelo(modelo)">
                          <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

      </div>
    </div>

    <!-- ── Formulario Marca ───────────────────────────────────────────────────── -->
    <hlm-dialog [state]="brandFormState()" (stateChanged)="onBrandFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideTag" />
            <h2 class="text-sm font-semibold">{{ editingBrand() ? 'Editar marca' : 'Nueva marca' }}</h2>
          </div>
          <div class="space-y-4 py-2">
            @if (brandFormError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ brandFormError() }}</div>
            }
            <div class="space-y-1.5">
              <label hlmLabel for="brandName">Nombre <span class="text-destructive">*</span></label>
              <input hlmInput id="brandName" class="w-full" placeholder="Ej. Samsung"
                [ngModel]="brandFormName()" (ngModelChange)="brandFormName.set($event)" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel for="brandDesc">Descripción</label>
              <textarea id="brandDesc"
                class="flex min-h-[80px] w-full rounded-md border border-primary bg-action/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="Descripción opcional"
                [ngModel]="brandFormDescription()" (ngModelChange)="brandFormDescription.set($event)"
              ></textarea>
            </div>
          </div>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose [disabled]="brandSaving()">Cancelar</button>
            @if (!editingBrand()) {
              <button hlmBtn variant="default" (click)="saveBrandAndNext()" [disabled]="brandSaving()">
                @if (brandSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Siguiente
              </button>
            }
            <button hlmBtn (click)="saveBrand()" [disabled]="brandSaving()">
              @if (brandSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              {{ editingBrand() ? 'Aceptar' : 'Alta' }}
            </button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- ── Confirmar borrar Marca ─────────────────────────────────────────────── -->
    <hlm-dialog [state]="brandDeleteState()" (stateChanged)="onBrandDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideTag" />
            <h2 class="text-sm font-semibold">¿Eliminar marca?</h2>
          </div>
          <p class="text-sm py-2">Se eliminará <strong>{{ brandToDelete()?.name }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline" [class]="btnDestructiveCls" (click)="confirmDeleteBrand()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- ── Formulario Modelo ──────────────────────────────────────────────────── -->
    <hlm-dialog [state]="modelFormState()" (stateChanged)="onModelFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideCpu" />
            <h2 class="text-sm font-semibold">{{ editingModelo() ? 'Editar modelo' : 'Nuevo modelo' }}@if (selectedBrand()) { — {{ selectedBrand()!.name }}}</h2>
          </div>
          <div class="space-y-4 py-2">
            @if (modelFormError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ modelFormError() }}</div>
            }
            <div class="space-y-1.5">
              <label hlmLabel for="modTipoMat">Tipo de material <span class="text-destructive">*</span></label>
              <select id="modTipoMat"
                class="w-full h-9 rounded-md border border-primary bg-action/5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                [ngModel]="modelFormTipoMaterialId()" (ngModelChange)="modelFormTipoMaterialId.set($event)"
              >
                <option value="">Selecciona un tipo de material...</option>
                @for (t of tiposMaterial(); track t.id) {
                  <option [value]="t.id">{{ t.name }}</option>
                }
              </select>
            </div>
            <div class="space-y-1.5">
              <label hlmLabel for="modDesc">Descripción</label>
              <input hlmInput id="modDesc" class="w-full" placeholder="Ej. iPhone 14 Pro"
                [ngModel]="modelFormDescription()" (ngModelChange)="modelFormDescription.set($event)" />
            </div>
          </div>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose [disabled]="modelSaving()">Cancelar</button>
            @if (!editingModelo()) {
              <button hlmBtn variant="default" (click)="saveModeloAndNext()" [disabled]="modelSaving()">
                @if (modelSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Siguiente
              </button>
            }
            <button hlmBtn (click)="saveModelo()" [disabled]="modelSaving()">
              @if (modelSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              {{ editingModelo() ? 'Aceptar' : 'Alta' }}
            </button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- ── Confirmar borrar Modelo ────────────────────────────────────────────── -->
    <hlm-dialog [state]="modelDeleteState()" (stateChanged)="onModelDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideCpu" />
            <h2 class="text-sm font-semibold">¿Eliminar modelo?</h2>
          </div>
          <p class="text-sm py-2">Se eliminará <strong>{{ modeloToDelete()?.description ?? 'este modelo' }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline" [class]="btnDestructiveCls" (click)="confirmDeleteModelo()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class BrandsComponent extends GridBase<Brand> implements OnInit {
  protected override readonly gridId        = 'inventory-brands';
  protected override readonly labelSingular = 'Marca';
  protected override readonly labelPlural   = 'Marcas';
  protected override readonly icon          = 'lucideTag';
  protected override readonly colMetaTableName = 't200_marcas';
  protected override readonly gridViews: GridViewDef[] = [GRID_VIEW.GRID, GRID_VIEW.GRID_DETAIL, GRID_VIEW.CARD];

  private readonly splitContainerRef    = viewChild<ElementRef<HTMLElement>>('splitContainer');
  private readonly selectAllCbRef       = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');
  private readonly selectAllModelCbRef  = viewChild<ElementRef<HTMLInputElement>>('selectAllModelCb');
  private readonly doc  = inject(DOCUMENT);
  private readonly zone = inject(NgZone);

  constructor() {
    super();
    effect(() => {
      const el = this.selectAllCbRef()?.nativeElement;
      if (el) el.indeterminate = this.someSelected();
    });
    effect(() => {
      const el = this.selectAllModelCbRef()?.nativeElement;
      if (el) el.indeterminate = this.modelSomeSelected();
    });
  }

  // ── Split ────────────────────────────────────────────────────────────────────
  topPanelPct = signal(50);

  // ── Brand selection (row click → show models) ────────────────────────────────
  selectedBrand = signal<Brand | null>(null);

  // ── Brands CRUD ──────────────────────────────────────────────────────────────
  editingBrand         = signal<Brand | null>(null);
  brandToDelete        = signal<Brand | null>(null);
  brandFormName        = signal('');
  brandFormDescription = signal('');
  brandFormError       = signal<string | null>(null);
  brandFormState       = signal<DialogState>(null);
  brandDeleteState     = signal<DialogState>(null);
  brandSaving          = signal(false);

  // ── Models panel ─────────────────────────────────────────────────────────────
  private readonly allModelos       = signal<Modelo[]>([]);
  loadingModelos                    = signal(false);
  modelosError                      = signal<string | null>(null);
  modelSearchInput                  = signal('');
  tiposMaterial                     = signal<TipoMaterial[]>([]);
  readonly modelViews               = MODEL_VIEWS;
  modelView                         = signal<ModelViewId>('GRID');
  showModelViewPicker               = signal(false);
  showModelFilters                  = signal(false);
  filterModelTipoMaterialId         = signal('');

  readonly modelViewIcon = computed(() =>
    MODEL_VIEWS.find(v => v.id === this.modelView())?.icon ?? 'lucideLayoutList'
  );

  readonly filteredModelos = computed(() => {
    const search     = this.modelSearchInput().toLowerCase().trim();
    const tipoFilter = this.filterModelTipoMaterialId();
    let list         = this.allModelos();
    if (tipoFilter) list = list.filter(m => m.tipoMaterialId === tipoFilter);
    if (!search) return list;
    return list.filter(m =>
      (m.description?.toLowerCase().includes(search) ?? false) ||
      m.tipoMaterialNombre.toLowerCase().includes(search)
    );
  });

  // ── Models multi-selection ────────────────────────────────────────────────────
  modelSelectedIds = signal<Set<string>>(new Set());

  readonly modelSelectionCount = computed(() => this.modelSelectedIds().size);

  readonly modelAllSelected = computed(() => {
    const list = this.filteredModelos();
    return list.length > 0 && list.every(m => this.modelSelectedIds().has(m.id));
  });

  readonly modelSomeSelected = computed(() => {
    const list = this.filteredModelos();
    return list.some(m => this.modelSelectedIds().has(m.id)) && !this.modelAllSelected();
  });

  toggleModelSelect(id: string): void {
    const s = new Set(this.modelSelectedIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.modelSelectedIds.set(s);
  }

  toggleModelSelectAll(): void {
    const list = this.filteredModelos();
    if (this.modelAllSelected()) {
      this.modelSelectedIds.set(new Set());
    } else {
      this.modelSelectedIds.set(new Set(list.map(m => m.id)));
    }
  }

  clearModelSelection(): void { this.modelSelectedIds.set(new Set()); }

  // ── Models CRUD ───────────────────────────────────────────────────────────────
  editingModelo           = signal<Modelo | null>(null);
  modeloToDelete          = signal<Modelo | null>(null);
  modelFormTipoMaterialId = signal('');
  modelFormDescription    = signal('');
  modelFormError          = signal<string | null>(null);
  modelFormState          = signal<DialogState>(null);
  modelDeleteState        = signal<DialogState>(null);
  modelSaving             = signal(false);

  override ngOnInit(): void {
    this.loadGridPrefs();
    this.load();
    this.loadTiposMaterial();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Brand[]>(BRANDS_API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar las marcas. Comprueba la conexión con el servidor.'); this.loading.set(false); },
    });
  }

  private loadTiposMaterial(): void {
    this.http.get<TipoMaterial[]>(TIPOS_MAT_API).subscribe({
      next: data => this.tiposMaterial.set(data),
    });
  }

  reloadModelos(): void {
    const brand = this.selectedBrand();
    if (!brand) return;
    this.loadingModelos.set(true);
    this.modelosError.set(null);
    this.http.get<Modelo[]>(`${MODELOS_API}?marcaId=${brand.id}`).subscribe({
      next:  data => { this.allModelos.set(data); this.loadingModelos.set(false); },
      error: ()   => { this.modelosError.set('Error al cargar los modelos.'); this.loadingModelos.set(false); },
    });
  }

  selectBrand(brand: Brand): void {
    if (this.selectedBrand()?.id === brand.id) {
      this.selectedBrand.set(null);
      this.allModelos.set([]);
      this.modelSelectedIds.set(new Set());
    } else {
      this.selectedBrand.set(brand);
      this.modelSearchInput.set('');
      this.filterModelTipoMaterialId.set('');
      this.modelSelectedIds.set(new Set());
      this.reloadModelos();
    }
  }

  setModelView(id: ModelViewId): void { this.modelView.set(id); }

  // ── Split resize ──────────────────────────────────────────────────────────────
  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    const container = this.splitContainerRef()?.nativeElement;
    if (!container) return;
    const startY      = event.clientY;
    const startPct    = this.topPanelPct();
    const totalHeight = container.getBoundingClientRect().height;
    this.zone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => {
        const delta  = e.clientY - startY;
        const newPct = Math.max(20, Math.min(80, startPct + (delta / totalHeight) * 100));
        this.zone.run(() => this.topPanelPct.set(newPct));
      };
      const onUp = () => {
        this.doc.removeEventListener('mousemove', onMove);
        this.doc.removeEventListener('mouseup', onUp);
      };
      this.doc.addEventListener('mousemove', onMove);
      this.doc.addEventListener('mouseup', onUp);
    });
  }

  // ── Brands CRUD ───────────────────────────────────────────────────────────────
  onBrandFormStateChanged(s: string): void   { if (s === 'closed') this.brandFormState.set(null); }
  onBrandDeleteStateChanged(s: string): void { if (s === 'closed') this.brandDeleteState.set(null); }

  openCreateBrand(): void {
    this.editingBrand.set(null);
    this.brandFormName.set('');
    this.brandFormDescription.set('');
    this.brandFormError.set(null);
    this.brandFormState.set('open');
  }

  openEditBrand(brand: Brand): void {
    this.editingBrand.set(brand);
    this.brandFormName.set(brand.name);
    this.brandFormDescription.set(brand.description ?? '');
    this.brandFormError.set(null);
    this.brandFormState.set('open');
  }

  openDeleteBrand(brand: Brand): void {
    this.brandToDelete.set(brand);
    this.brandDeleteState.set('open');
  }

  private doSaveBrand(onSuccess: () => void): void {
    const name = this.brandFormName().trim();
    if (!name) { this.brandFormError.set('El nombre es obligatorio.'); return; }
    const body: BrandRequest = { name, description: this.brandFormDescription().trim() || null };
    this.brandSaving.set(true);
    this.brandFormError.set(null);
    const editing = this.editingBrand();
    const req$ = editing
      ? this.http.put<Brand>(`${BRANDS_API}/${editing.id}`, body)
      : this.http.post<Brand>(BRANDS_API, body);
    req$.subscribe({
      next:  () => { this.brandSaving.set(false); this.load(); onSuccess(); },
      error: () => { this.brandFormError.set('Error al guardar. Inténtalo de nuevo.'); this.brandSaving.set(false); },
    });
  }

  saveBrand(): void { this.doSaveBrand(() => this.brandFormState.set('closed')); }
  saveBrandAndNext(): void {
    this.doSaveBrand(() => {
      this.brandFormName.set('');
      this.brandFormDescription.set('');
      this.brandFormError.set(null);
    });
  }

  confirmDeleteBrand(): void {
    const brand = this.brandToDelete();
    if (!brand) return;
    this.http.delete(`${BRANDS_API}/${brand.id}`).subscribe({
      next: () => {
        this.brandDeleteState.set('closed');
        if (this.selectedBrand()?.id === brand.id) { this.selectedBrand.set(null); this.allModelos.set([]); }
        this.load();
      },
      error: () => { this.brandDeleteState.set('closed'); this.error.set('Error al eliminar la marca.'); },
    });
  }

  // ── Models CRUD ───────────────────────────────────────────────────────────────
  onModelFormStateChanged(s: string): void   { if (s === 'closed') this.modelFormState.set(null); }
  onModelDeleteStateChanged(s: string): void { if (s === 'closed') this.modelDeleteState.set(null); }

  openCreateModelo(): void {
    this.editingModelo.set(null);
    this.modelFormTipoMaterialId.set('');
    this.modelFormDescription.set('');
    this.modelFormError.set(null);
    this.modelFormState.set('open');
  }

  openEditModelo(modelo: Modelo): void {
    this.editingModelo.set(modelo);
    this.modelFormTipoMaterialId.set(modelo.tipoMaterialId);
    this.modelFormDescription.set(modelo.description ?? '');
    this.modelFormError.set(null);
    this.modelFormState.set('open');
  }

  openDeleteModelo(modelo: Modelo): void {
    this.modeloToDelete.set(modelo);
    this.modelDeleteState.set('open');
  }

  private doSaveModelo(onSuccess: () => void): void {
    if (!this.modelFormTipoMaterialId()) { this.modelFormError.set('El tipo de material es obligatorio.'); return; }
    const brand = this.selectedBrand();
    if (!brand) return;
    const body: ModeloRequest = {
      tipoMaterialId: this.modelFormTipoMaterialId(),
      marcaId:        brand.id,
      description:    this.modelFormDescription().trim() || null,
    };
    this.modelSaving.set(true);
    this.modelFormError.set(null);
    const editing = this.editingModelo();
    const req$ = editing
      ? this.http.put<Modelo>(`${MODELOS_API}/${editing.id}`, body)
      : this.http.post<Modelo>(MODELOS_API, body);
    req$.subscribe({
      next:  () => { this.modelSaving.set(false); this.reloadModelos(); onSuccess(); },
      error: () => { this.modelFormError.set('Error al guardar. Inténtalo de nuevo.'); this.modelSaving.set(false); },
    });
  }

  saveModelo(): void { this.doSaveModelo(() => this.modelFormState.set('closed')); }
  saveModeloAndNext(): void {
    this.doSaveModelo(() => {
      this.modelFormTipoMaterialId.set('');
      this.modelFormDescription.set('');
      this.modelFormError.set(null);
    });
  }

  confirmDeleteModelo(): void {
    const modelo = this.modeloToDelete();
    if (!modelo) return;
    this.http.delete(`${MODELOS_API}/${modelo.id}`).subscribe({
      next:  () => { this.modelDeleteState.set('closed'); this.reloadModelos(); },
      error: () => { this.modelDeleteState.set('closed'); this.modelosError.set('Error al eliminar el modelo.'); },
    });
  }
}
