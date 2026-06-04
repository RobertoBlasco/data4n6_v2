import {
  ChangeDetectionStrategy, Component, ElementRef, NgZone, OnInit,
  computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { DOCUMENT, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePencil, lucideTrash2, lucidePlus, lucideFlaskConical, lucideTag, lucideCpu,
  lucideRefreshCw, lucideDownload, lucideUpload,
  lucideLayoutList, lucideLayoutGrid, lucideTable2, lucidePanelsLeftRight,
  lucideSlidersHorizontal, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
  lucideExternalLink,
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

interface Material    { id: string; name: string; description: string | null; }
interface MaterialRequest { name: string; description: string | null; }
interface MatMarca    { id: string; tipoMaterialId: string; tipoMaterialNombre: string; marcaId: string; marcaNombre: string; }
interface MatMarcaRequest { tipoMaterialId: string; marcaId: string; }
interface Brand       { id: string; name: string; }
interface Modelo      { id: string; tipoMaterialId: string; tipoMaterialNombre: string; marcaId: string; marcaNombre: string; description: string | null; }
interface ModeloRequest { tipoMaterialId: string; marcaId: string; description: string | null; }

const TIPOS_MAT_API  = 'http://localhost:8080/api/v1/inventory/tipos-material';
const MAT_MARCAS_API = 'http://localhost:8080/api/v1/inventory/materiales-marcas';
const BRANDS_API     = 'http://localhost:8080/api/v1/inventory/brands';
const MODELOS_API    = 'http://localhost:8080/api/v1/inventory/modelos';
type DialogState = 'open' | 'closed' | null;

const ASSOC_VIEWS = [
  { id: 'GRID', label: 'Tabla',    icon: 'lucideLayoutList', description: 'Vista compacta en tabla' },
  { id: 'CARD', label: 'Tarjetas', icon: 'lucideLayoutGrid', description: 'Vista en tarjetas' },
] as const;
type AssocViewId = typeof ASSOC_VIEWS[number]['id'];

const MODEL_VIEWS = [
  { id: 'GRID', label: 'Tabla',    icon: 'lucideLayoutList', description: 'Vista compacta en tabla' },
  { id: 'CARD', label: 'Tarjetas', icon: 'lucideLayoutGrid', description: 'Vista en tarjetas' },
] as const;
type ModelViewId = typeof MODEL_VIEWS[number]['id'];

@Component({
  selector: 'app-materials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgClass,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmTableImports, BrnDialogContent, HlmDialogImports,
    HlmSpinnerImports, HlmIconImports, HlmTooltipImports,
  ],
  providers: [provideIcons({
    lucidePencil, lucideTrash2, lucidePlus, lucideFlaskConical, lucideTag, lucideCpu,
    lucideRefreshCw, lucideDownload, lucideUpload,
    lucideLayoutList, lucideLayoutGrid, lucideTable2, lucidePanelsLeftRight,
    lucideSlidersHorizontal, lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideExternalLink,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0 gap-0 overflow-hidden" #splitContainer>

      <!-- ══ Panel superior: Tipos de material ══════════════════════════════════ -->
      <div class="flex flex-col min-h-0 rounded-t-lg border-2 border-primary bg-background overflow-hidden"
           [style.height.%]="topPanelPct()">

        <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">
          @if (selectionCount() === 0) {
            <h1 class="text-sm font-semibold flex items-center gap-1.5">
              <ng-icon hlmIcon size="sm" name="lucideFlaskConical" />{{ gridTitle() }}
            </h1>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Recargar" (click)="reload()">
                <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
              </button>
              <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Exportar">
                <ng-icon hlmIcon size="sm" name="lucideDownload" />
              </button>
              <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Importar">
                <ng-icon hlmIcon size="sm" name="lucideUpload" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Columnas">
                <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
              </button>
              <div class="relative">
                <button hlmBtn variant="ghost" size="icon"
                  class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  [class.bg-primary-foreground/20]="showViewPicker()"
                  title="Cambiar vista" (click)="toggleViewPicker()">
                  <ng-icon hlmIcon size="sm" [name]="activeView().icon" />
                </button>
                @if (showViewPicker()) {
                  <div class="fixed inset-0 z-40" (click)="showViewPicker.set(false)"></div>
                  <div class="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
                    @for (view of gridViews; track view.id) {
                      <button class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                        [class.font-semibold]="activeView().id === view.id" (click)="setView(view)">
                        <ng-icon hlmIcon size="sm" [name]="view.icon" class="shrink-0" />
                        <span class="flex flex-col">
                          <span>{{ view.label }}</span>
                          @if (view.description) { <span class="text-[10px] text-muted-foreground font-normal">{{ view.description }}</span> }
                        </span>
                      </button>
                    }
                  </div>
                }
              </div>
              <button hlmBtn variant="ghost" size="icon"
                class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                [class.bg-primary-foreground/20]="showAdvancedFilters()"
                title="Filtros avanzados" (click)="showAdvancedFilters.set(!showAdvancedFilters())">
                <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="action" size="sm" class="h-7" (click)="openCreateMaterial()">
                <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />Nuevo {{ labelSingular.toLowerCase() }}
              </button>
            </div>
          } @else {
            <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15"
                (click)="singleSelected() && openDeleteMaterial(singleSelected()!)">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
              </button>
              @if (selectionCount() === 1) {
                <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  (click)="goToForm(singleSelected()!)">
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

        <div class="px-3 py-2 shrink-0 border-b border-border">
          <div class="relative">
            <ng-icon hlmIcon size="sm" name="lucideSearch" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Buscar en tipos de material..."
              [value]="searchInput()" (input)="onSearchInput($any($event.target).value)" />
            @if (searchInput()) {
              <button class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" (click)="clearSearch()">
                <ng-icon hlmIcon size="sm" name="lucideX" />
              </button>
            }
          </div>
        </div>

        @if (showAdvancedFilters()) {
          <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
            <p class="text-xs text-muted-foreground italic">Sin filtros avanzados para esta rejilla</p>
          </div>
        }

        <div class="flex-1 overflow-auto min-h-0">
          @if (loading()) { <div class="flex items-center justify-center py-12"><hlm-spinner /></div> }
          @if (error() && !loading()) {
            <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
          }
          @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
            <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <ng-icon hlmIcon size="lg" [name]="icon" class="opacity-25" />
              <p class="text-sm">No hay {{ labelPlural.toLowerCase() }} registrados</p>
              <button hlmBtn variant="outline" size="sm" (click)="openCreateMaterial()">
                <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primer {{ labelSingular.toLowerCase() }}
              </button>
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
            @if (activeView().id === 'CARD') {
              <div class="grid gap-3 p-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">
                @for (material of pageItems(); track material.id) {
                  <div class="group flex flex-col rounded-lg border bg-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                    [class.border-primary]="selectedMaterial()?.id === material.id"
                    (click)="selectMaterial(material)">
                    <div class="flex items-center gap-2 mb-2">
                      <input type="checkbox" class="accent-primary cursor-pointer shrink-0"
                        [checked]="selectedIds().has(material.id)"
                        (click)="$event.stopPropagation()" (change)="toggleSelect(material.id)" />
                      <ng-icon hlmIcon [name]="icon" size="sm" class="text-primary shrink-0" />
                      <span class="text-sm leading-tight truncate">{{ material.name }}</span>
                    </div>
                    @if (material.description) {
                      <p class="text-xs text-muted-foreground line-clamp-2 flex-1">{{ material.description }}</p>
                    } @else {
                      <p class="text-xs text-muted-foreground italic flex-1">Sin descripción</p>
                    }
                    <div class="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
                      <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEditMaterial(material)">
                        <ng-icon hlmIcon size="sm" name="lucidePencil" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-6" title="Abrir formulario" (click)="goToForm(material)">
                        <ng-icon hlmIcon size="sm" name="lucideExternalLink" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteMaterial(material)">
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
                    <th hlmTh class="w-20 text-right">Acc.</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (material of pageItems(); track material.id; let odd = $odd) {
                    <tr hlmTr class="cursor-pointer"
                      [class.bg-primary/15]="selectedMaterial()?.id === material.id"
                      [ngClass]="selectedMaterial()?.id === material.id ? '' : [odd ? rowStripeClass : '', rowHoverClass]"
                      (click)="selectMaterial(material)">
                      <td hlmTd class="pr-0" (click)="$event.stopPropagation()">
                        <input type="checkbox" class="accent-primary cursor-pointer"
                          [checked]="selectedIds().has(material.id)" (change)="toggleSelect(material.id)" />
                      </td>
                      <td hlmTd>{{ material.name }}</td>
                      <td hlmTd class="text-muted-foreground">{{ material.description ?? '—' }}</td>
                      <td hlmTd class="text-right">
                        <div class="flex items-center justify-end gap-0.5" (click)="$event.stopPropagation()">
                          <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEditMaterial(material)">
                            <ng-icon hlmIcon size="sm" name="lucidePencil" />
                          </button>
                          <button hlmBtn variant="ghost" size="icon" class="size-6" title="Abrir formulario" (click)="goToForm(material)">
                            <ng-icon hlmIcon size="sm" name="lucideExternalLink" />
                          </button>
                          <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteMaterial(material)">
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
                @else { <button hlmBtn [variant]="p === currentPage() + 1 ? 'default' : 'ghost'" size="icon" class="size-6 text-xs" (click)="setPage(+p - 1)">{{ p }}</button> }
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

      <!-- ── Divisor horizontal ──────────────────────────────────────────────── -->
      <div class="h-1.5 shrink-0 bg-action/60 hover:bg-action cursor-row-resize transition-colors"
           (mousedown)="onDividerMouseDown($event)"></div>

      <!-- ══ Fila inferior: split vertical Marcas | Modelos ═════════════════════ -->
      <div class="flex flex-row min-h-0 rounded-b-lg border-2 border-primary bg-background overflow-hidden flex-1" #bottomContainer>

        <!-- ── Panel izquierdo: Marcas asociadas ───────────────────────────── -->
        <div class="flex flex-col min-h-0 overflow-hidden border-r border-border" [style.width.%]="leftPanelPct()">

          <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">
            @if (assocSelectionCount() === 0) {
              <h2 class="text-sm font-semibold truncate">
                Marcas@if (selectedMaterial()) {&nbsp;— {{ selectedMaterial()!.name }}}
              </h2>
              <div class="flex items-center gap-0.5 shrink-0">
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Recargar" [disabled]="!selectedMaterial()" (click)="reloadAssocs()">
                  <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
                </button>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Exportar" [disabled]="!selectedMaterial()">
                  <ng-icon hlmIcon size="sm" name="lucideDownload" />
                </button>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Importar" [disabled]="!selectedMaterial()">
                  <ng-icon hlmIcon size="sm" name="lucideUpload" />
                </button>
                <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Columnas" [disabled]="!selectedMaterial()">
                  <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
                </button>
                <div class="relative">
                  <button hlmBtn variant="ghost" size="icon"
                    class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                    [class.bg-primary-foreground/20]="showAssocViewPicker()"
                    title="Cambiar vista" [disabled]="!selectedMaterial()"
                    (click)="showAssocViewPicker.set(!showAssocViewPicker())">
                    <ng-icon hlmIcon size="sm" [name]="assocViewIcon()" />
                  </button>
                  @if (showAssocViewPicker()) {
                    <div class="fixed inset-0 z-40" (click)="showAssocViewPicker.set(false)"></div>
                    <div class="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
                      @for (v of assocViews; track v.id) {
                        <button class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                          [class.font-semibold]="assocView() === v.id"
                          (click)="setAssocView(v.id); showAssocViewPicker.set(false)">
                          <ng-icon hlmIcon size="sm" [name]="v.icon" class="shrink-0" />
                          <span class="flex flex-col">
                            <span>{{ v.label }}</span>
                            @if (v.description) { <span class="text-[10px] text-muted-foreground font-normal">{{ v.description }}</span> }
                          </span>
                        </button>
                      }
                    </div>
                  }
                </div>
                <button hlmBtn variant="ghost" size="icon"
                  class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  [class.bg-primary-foreground/20]="showAssocFilters()"
                  title="Filtros avanzados" [disabled]="!selectedMaterial()"
                  (click)="showAssocFilters.set(!showAssocFilters())">
                  <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
                </button>
                <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
                <button hlmBtn variant="action" size="sm" class="h-7"
                  [disabled]="!selectedMaterial() || availableBrands().length === 0"
                  (click)="openCreateAssoc()">
                  <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />Añadir
                </button>
              </div>
            } @else {
              <span class="text-sm">{{ assocSelectionCount() }} seleccionada{{ assocSelectionCount() !== 1 ? 's' : '' }}</span>
              <div class="flex items-center gap-0.5">
                <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15">
                  <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
                </button>
                <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Deseleccionar" (click)="clearAssocSelection()">
                  <ng-icon hlmIcon size="sm" name="lucideX" />
                </button>
              </div>
            }
          </div>

          @if (selectedMaterial()) {
            <div class="px-3 py-2 shrink-0 border-b border-border">
              <div class="relative">
                <ng-icon hlmIcon size="sm" name="lucideSearch" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Buscar marca..."
                  [value]="assocSearchInput()" (input)="assocSearchInput.set($any($event.target).value)" />
                @if (assocSearchInput()) {
                  <button class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" (click)="assocSearchInput.set('')">
                    <ng-icon hlmIcon size="sm" name="lucideX" />
                  </button>
                }
              </div>
            </div>
            @if (showAssocFilters()) {
              <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
                <p class="text-xs text-muted-foreground italic">Sin filtros avanzados para esta rejilla</p>
              </div>
            }
          }

          <div class="flex-1 overflow-auto min-h-0">
            @if (!selectedMaterial()) {
              <div class="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideTag" class="opacity-20" />
                <p class="text-sm text-center px-4">Selecciona un tipo de material</p>
              </div>
            } @else if (loadingAssocs()) {
              <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
            } @else if (assocsError()) {
              <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ assocsError() }}</div>
            } @else if (filteredAssocs().length === 0 && !assocSearchInput()) {
              <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideTag" class="opacity-25" />
                <p class="text-sm text-center px-4">Sin marcas asociadas</p>
                @if (availableBrands().length > 0) {
                  <button hlmBtn variant="outline" size="sm" (click)="openCreateAssoc()">
                    <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primera
                  </button>
                }
              </div>
            } @else if (filteredAssocs().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
                <p class="text-sm">Sin resultados</p>
                <button hlmBtn variant="outline" size="sm" (click)="assocSearchInput.set('')">Limpiar</button>
              </div>
            } @else if (assocView() === 'CARD') {
              <div class="flex flex-col gap-2 p-3">
                @for (assoc of filteredAssocs(); track assoc.id) {
                  <div class="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                    [class.border-primary]="selectedAssocMarca()?.id === assoc.id"
                    [class.bg-primary/15]="selectedAssocMarca()?.id === assoc.id"
                    (click)="selectAssocMarca(assoc)">
                    <div (click)="$event.stopPropagation()">
                      <input type="checkbox" class="accent-primary cursor-pointer"
                        [checked]="assocSelectedIds().has(assoc.id)"
                        (change)="toggleAssocSelect(assoc.id)" />
                    </div>
                    <ng-icon hlmIcon name="lucideTag" size="sm" class="text-primary shrink-0" />
                    <span class="text-sm flex-1 truncate">{{ assoc.marcaNombre }}</span>
                    <button hlmBtn variant="ghost" size="icon" class="size-5 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      (click)="$event.stopPropagation(); openDeleteAssoc(assoc)">
                      <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                    </button>
                  </div>
                }
              </div>
            } @else {
              <table hlmTable class="w-full">
                <thead hlmTHead [ngClass]="headerColor">
                  <tr hlmTr>
                    <th hlmTh class="w-8 pr-0">
                      <input #selectAllAssocCb type="checkbox" class="accent-primary cursor-pointer"
                        [checked]="assocAllSelected()" (change)="toggleAssocSelectAll()" />
                    </th>
                    <th hlmTh>Marca</th>
                    <th hlmTh class="w-12 text-right">Acc.</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (assoc of filteredAssocs(); track assoc.id; let odd = $odd) {
                    <tr hlmTr class="cursor-pointer"
                      [class.bg-primary/15]="selectedAssocMarca()?.id === assoc.id"
                      [ngClass]="selectedAssocMarca()?.id === assoc.id ? '' : [odd ? rowStripeClass : '', rowHoverClass]"
                      (click)="selectAssocMarca(assoc)">
                      <td hlmTd class="pr-0" (click)="$event.stopPropagation()">
                        <input type="checkbox" class="accent-primary cursor-pointer"
                          [checked]="assocSelectedIds().has(assoc.id)"
                          (change)="toggleAssocSelect(assoc.id)" />
                      </td>
                      <td hlmTd>
                        <div class="flex items-center gap-2">
                          <ng-icon hlmIcon name="lucideTag" size="sm" class="text-muted-foreground shrink-0" />
                          {{ assoc.marcaNombre }}
                        </div>
                      </td>
                      <td hlmTd class="text-right">
                        <div class="flex items-center justify-end" (click)="$event.stopPropagation()">
                          <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDeleteAssoc(assoc)">
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

        <!-- ── Divisor vertical ────────────────────────────────────────────── -->
        <div class="w-1.5 shrink-0 bg-action/60 hover:bg-action cursor-col-resize transition-colors"
             (mousedown)="onVertDividerMouseDown($event)"></div>

        <!-- ── Panel derecho: Modelos ──────────────────────────────────────── -->
        <div class="flex flex-col min-h-0 overflow-hidden flex-1">

          <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">
            @if (modelSelectionCount() === 0) {
              <h2 class="text-sm font-semibold truncate">
                Modelos@if (selectedAssocMarca()) {&nbsp;— {{ selectedAssocMarca()!.marcaNombre }}}
              </h2>
              <div class="flex items-center gap-0.5 shrink-0">
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Recargar" [disabled]="!selectedAssocMarca()" (click)="reloadModelos()">
                  <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
                </button>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Exportar" [disabled]="!selectedAssocMarca()">
                  <ng-icon hlmIcon size="sm" name="lucideDownload" />
                </button>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Importar" [disabled]="!selectedAssocMarca()">
                  <ng-icon hlmIcon size="sm" name="lucideUpload" />
                </button>
                <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Columnas" [disabled]="!selectedAssocMarca()">
                  <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
                </button>
                <div class="relative">
                  <button hlmBtn variant="ghost" size="icon"
                    class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                    [class.bg-primary-foreground/20]="showModelViewPicker()"
                    title="Cambiar vista" [disabled]="!selectedAssocMarca()"
                    (click)="showModelViewPicker.set(!showModelViewPicker())">
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
                            @if (v.description) { <span class="text-[10px] text-muted-foreground font-normal">{{ v.description }}</span> }
                          </span>
                        </button>
                      }
                    </div>
                  }
                </div>
                <button hlmBtn variant="ghost" size="icon"
                  class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  [class.bg-primary-foreground/20]="showModelFilters()"
                  title="Filtros avanzados" [disabled]="!selectedAssocMarca()"
                  (click)="showModelFilters.set(!showModelFilters())">
                  <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
                </button>
                <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
                <button hlmBtn variant="action" size="sm" class="h-7" [disabled]="!selectedAssocMarca()" (click)="openCreateModelo()">
                  <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />Nuevo
                </button>
              </div>
            } @else {
              <span class="text-sm">{{ modelSelectionCount() }} seleccionado{{ modelSelectionCount() !== 1 ? 's' : '' }}</span>
              <div class="flex items-center gap-0.5">
                <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15">
                  <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
                </button>
                <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
                <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Deseleccionar" (click)="clearModelSelection()">
                  <ng-icon hlmIcon size="sm" name="lucideX" />
                </button>
              </div>
            }
          </div>

          @if (selectedAssocMarca()) {
            <div class="px-3 py-2 shrink-0 border-b border-border">
              <div class="relative">
                <ng-icon hlmIcon size="sm" name="lucideSearch" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Buscar modelo..."
                  [value]="modelSearchInput()" (input)="modelSearchInput.set($any($event.target).value)" />
                @if (modelSearchInput()) {
                  <button class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" (click)="modelSearchInput.set('')">
                    <ng-icon hlmIcon size="sm" name="lucideX" />
                  </button>
                }
              </div>
            </div>
            @if (showModelFilters()) {
              <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
                <p class="text-xs text-muted-foreground italic">Sin filtros avanzados para esta rejilla</p>
              </div>
            }
          }

          <div class="flex-1 overflow-auto min-h-0">
            @if (!selectedAssocMarca()) {
              <div class="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideCpu" class="opacity-20" />
                <p class="text-sm text-center px-4">Selecciona una marca para ver sus modelos</p>
              </div>
            } @else if (loadingModelos()) {
              <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
            } @else if (modelosError()) {
              <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ modelosError() }}</div>
            } @else if (filteredModelos().length === 0 && !modelSearchInput()) {
              <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideCpu" class="opacity-25" />
                <p class="text-sm">Sin modelos para esta combinación</p>
                <button hlmBtn variant="outline" size="sm" (click)="openCreateModelo()">
                  <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primer modelo
                </button>
              </div>
            } @else if (filteredModelos().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
                <p class="text-sm">Sin resultados</p>
                <button hlmBtn variant="outline" size="sm" (click)="modelSearchInput.set('')">Limpiar</button>
              </div>
            } @else if (modelView() === 'CARD') {
              <div class="flex flex-col gap-2 p-3">
                @for (modelo of filteredModelos(); track modelo.id) {
                  <div class="group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 hover:border-primary/40 hover:shadow-sm transition-all">
                    <input type="checkbox" class="accent-primary cursor-pointer shrink-0"
                      [checked]="modelSelectedIds().has(modelo.id)"
                      (change)="toggleModelSelect(modelo.id)" />
                    <ng-icon hlmIcon name="lucideCpu" size="sm" class="text-primary shrink-0" />
                    <span class="text-sm flex-1 truncate">{{ modelo.description ?? '—' }}</span>
                    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>

    <!-- ══ Diálogos ════════════════════════════════════════════════════════════ -->

    <!-- Formulario Tipo de material -->
    <hlm-dialog [state]="materialFormState()" (stateChanged)="onMaterialFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideFlaskConical" />
            <h2 class="text-sm font-semibold">{{ editingMaterial() ? 'Editar ' + labelSingular.toLowerCase() : 'Nuevo ' + labelSingular.toLowerCase() }}</h2>
          </div>
          <div class="space-y-4 py-2">
            @if (materialFormError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ materialFormError() }}</div>
            }
            <div class="space-y-1.5">
              <label hlmLabel for="matName">Nombre <span class="text-destructive">*</span></label>
              <input hlmInput id="matName" class="w-full" placeholder="Ej. Aluminio"
                [ngModel]="materialFormName()" (ngModelChange)="materialFormName.set($event)" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel for="matDesc">Descripción</label>
              <textarea id="matDesc"
                class="flex min-h-[80px] w-full rounded-md border border-primary bg-action/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="Descripción opcional"
                [ngModel]="materialFormDescription()" (ngModelChange)="materialFormDescription.set($event)"></textarea>
            </div>
          </div>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose [disabled]="materialSaving()">Cancelar</button>
            @if (editingMaterial()) {
              <button hlmBtn variant="default" (click)="saveMaterialAndForm()" [disabled]="materialSaving()">
                @if (materialSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Aceptar + Formulario
              </button>
              <button hlmBtn (click)="saveMaterial()" [disabled]="materialSaving()">
                @if (materialSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Aceptar
              </button>
            } @else {
              <button hlmBtn variant="default" (click)="saveMaterialAndNext()" [disabled]="materialSaving()">
                @if (materialSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Siguiente
              </button>
              <button hlmBtn variant="default" (click)="saveMaterialAndForm()" [disabled]="materialSaving()">
                @if (materialSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Formulario
              </button>
              <button hlmBtn (click)="saveMaterial()" [disabled]="materialSaving()">
                @if (materialSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta
              </button>
            }
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- Confirmar borrar Tipo de material -->
    <hlm-dialog [state]="materialDeleteState()" (stateChanged)="onMaterialDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideFlaskConical" />
            <h2 class="text-sm font-semibold">¿Eliminar {{ labelSingular.toLowerCase() }}?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">Se eliminará <strong>{{ materialToDelete()?.name }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="destructive" (click)="confirmDeleteMaterial()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- Formulario añadir marca -->
    <hlm-dialog [state]="assocFormState()" (stateChanged)="onAssocFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideTag" />
            <h2 class="text-sm font-semibold">Añadir marca@if (selectedMaterial()) { — {{ selectedMaterial()!.name }}}</h2>
          </div>
          <div class="space-y-4 py-2">
            @if (assocFormError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ assocFormError() }}</div>
            }
            <div class="space-y-1.5">
              <label hlmLabel for="assocMarca">Marca <span class="text-destructive">*</span></label>
              <select id="assocMarca"
                class="w-full h-9 rounded-md border border-primary bg-action/5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                [ngModel]="assocFormMarcaId()" (ngModelChange)="assocFormMarcaId.set($event)">
                <option value="">Selecciona una marca...</option>
                @for (b of availableBrands(); track b.id) { <option [value]="b.id">{{ b.name }}</option> }
              </select>
            </div>
          </div>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose [disabled]="assocSaving()">Cancelar</button>
            <button hlmBtn variant="default" (click)="saveAssocAndNext()" [disabled]="assocSaving()">
              @if (assocSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Siguiente
            </button>
            <button hlmBtn (click)="saveAssoc()" [disabled]="assocSaving()">
              @if (assocSaving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta
            </button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- Confirmar borrar asociación -->
    <hlm-dialog [state]="assocDeleteState()" (stateChanged)="onAssocDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideTag" />
            <h2 class="text-sm font-semibold">¿Eliminar asociación?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">Se desasociará <strong>{{ assocToDelete()?.marcaNombre }}</strong> de este tipo de material.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="destructive" (click)="confirmDeleteAssoc()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- Formulario Modelo -->
    <hlm-dialog [state]="modelFormState()" (stateChanged)="onModelFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideCpu" />
            <h2 class="text-sm font-semibold">{{ editingModelo() ? 'Editar modelo' : 'Nuevo modelo' }}@if (selectedMaterial() && selectedAssocMarca()) { — {{ selectedMaterial()!.name }} / {{ selectedAssocMarca()!.marcaNombre }}}</h2>
          </div>
          <div class="space-y-4 py-2">
            @if (modelFormError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ modelFormError() }}</div>
            }
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

    <!-- Confirmar borrar Modelo -->
    <hlm-dialog [state]="modelDeleteState()" (stateChanged)="onModelDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideCpu" />
            <h2 class="text-sm font-semibold">¿Eliminar modelo?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">Se eliminará <strong>{{ modeloToDelete()?.description ?? 'este modelo' }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="destructive" (click)="confirmDeleteModelo()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class MaterialsComponent extends GridBase<Material> implements OnInit {
  protected override readonly gridId        = 'inventory-materials';
  protected override readonly labelSingular = 'Tipo de material';
  protected override readonly labelPlural   = 'Tipos de material';
  protected override readonly icon          = 'lucideFlaskConical';
  protected override readonly colMetaTableName = 't200_materiales';
  protected override readonly gridViews: GridViewDef[] = [GRID_VIEW.GRID, GRID_VIEW.GRID_DETAIL, GRID_VIEW.CARD];

  private readonly router = inject(Router);
  private readonly splitContainerRef    = viewChild<ElementRef<HTMLElement>>('splitContainer');
  private readonly bottomContainerRef   = viewChild<ElementRef<HTMLElement>>('bottomContainer');
  private readonly selectAllCbRef       = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');
  private readonly selectAllAssocCbRef  = viewChild<ElementRef<HTMLInputElement>>('selectAllAssocCb');
  private readonly selectAllModelCbRef  = viewChild<ElementRef<HTMLInputElement>>('selectAllModelCb');
  private readonly doc  = inject(DOCUMENT);
  private readonly zone = inject(NgZone);

  constructor() {
    super();
    effect(() => { const el = this.selectAllCbRef()?.nativeElement;      if (el) el.indeterminate = this.someSelected(); });
    effect(() => { const el = this.selectAllAssocCbRef()?.nativeElement; if (el) el.indeterminate = this.assocSomeSelected(); });
    effect(() => { const el = this.selectAllModelCbRef()?.nativeElement; if (el) el.indeterminate = this.modelSomeSelected(); });
  }

  // ── Splits ───────────────────────────────────────────────────────────────────
  topPanelPct  = signal(40);
  leftPanelPct = signal(40);

  // ── Top panel selection ───────────────────────────────────────────────────────
  selectedMaterial = signal<Material | null>(null);

  // ── Materials CRUD ────────────────────────────────────────────────────────────
  editingMaterial         = signal<Material | null>(null);
  materialToDelete        = signal<Material | null>(null);
  materialFormName        = signal('');
  materialFormDescription = signal('');
  materialFormError       = signal<string | null>(null);
  materialFormState       = signal<DialogState>(null);
  materialDeleteState     = signal<DialogState>(null);
  materialSaving          = signal(false);

  // ── Left panel: Marcas asociadas ──────────────────────────────────────────────
  private readonly allAssocs = signal<MatMarca[]>([]);
  loadingAssocs              = signal(false);
  assocsError                = signal<string | null>(null);
  assocSearchInput           = signal('');
  brands                     = signal<Brand[]>([]);
  readonly assocViews        = ASSOC_VIEWS;
  assocView                  = signal<AssocViewId>('GRID');
  showAssocViewPicker        = signal(false);
  showAssocFilters           = signal(false);

  readonly assocViewIcon = computed(() => ASSOC_VIEWS.find(v => v.id === this.assocView())?.icon ?? 'lucideLayoutList');

  readonly filteredAssocs = computed(() => {
    const s = this.assocSearchInput().toLowerCase().trim();
    const list = this.allAssocs();
    return s ? list.filter(a => a.marcaNombre.toLowerCase().includes(s)) : list;
  });

  readonly availableBrands = computed(() => {
    const used = new Set(this.allAssocs().map(a => a.marcaId));
    return this.brands().filter(b => !used.has(b.id));
  });

  assocSelectedIds = signal<Set<string>>(new Set());
  readonly assocSelectionCount = computed(() => this.assocSelectedIds().size);
  readonly assocAllSelected    = computed(() => { const l = this.filteredAssocs(); return l.length > 0 && l.every(a => this.assocSelectedIds().has(a.id)); });
  readonly assocSomeSelected   = computed(() => { const l = this.filteredAssocs(); return l.some(a => this.assocSelectedIds().has(a.id)) && !this.assocAllSelected(); });

  toggleAssocSelect(id: string): void { const s = new Set(this.assocSelectedIds()); s.has(id) ? s.delete(id) : s.add(id); this.assocSelectedIds.set(s); }
  toggleAssocSelectAll(): void { this.assocAllSelected() ? this.assocSelectedIds.set(new Set()) : this.assocSelectedIds.set(new Set(this.filteredAssocs().map(a => a.id))); }
  clearAssocSelection(): void  { this.assocSelectedIds.set(new Set()); }

  assocToDelete    = signal<MatMarca | null>(null);
  assocFormMarcaId = signal('');
  assocFormError   = signal<string | null>(null);
  assocFormState   = signal<DialogState>(null);
  assocDeleteState = signal<DialogState>(null);
  assocSaving      = signal(false);

  // ── Right panel selection (drives modelos) ────────────────────────────────────
  selectedAssocMarca = signal<MatMarca | null>(null);

  // ── Right panel: Modelos ──────────────────────────────────────────────────────
  private readonly allModelos = signal<Modelo[]>([]);
  loadingModelos              = signal(false);
  modelosError                = signal<string | null>(null);
  modelSearchInput            = signal('');
  readonly modelViews         = MODEL_VIEWS;
  modelView                   = signal<ModelViewId>('GRID');
  showModelViewPicker         = signal(false);
  showModelFilters            = signal(false);

  readonly modelViewIcon = computed(() => MODEL_VIEWS.find(v => v.id === this.modelView())?.icon ?? 'lucideLayoutList');

  readonly filteredModelos = computed(() => {
    const s = this.modelSearchInput().toLowerCase().trim();
    const list = this.allModelos();
    return s ? list.filter(m => (m.description?.toLowerCase().includes(s) ?? false)) : list;
  });

  modelSelectedIds = signal<Set<string>>(new Set());
  readonly modelSelectionCount = computed(() => this.modelSelectedIds().size);
  readonly modelAllSelected    = computed(() => { const l = this.filteredModelos(); return l.length > 0 && l.every(m => this.modelSelectedIds().has(m.id)); });
  readonly modelSomeSelected   = computed(() => { const l = this.filteredModelos(); return l.some(m => this.modelSelectedIds().has(m.id)) && !this.modelAllSelected(); });

  toggleModelSelect(id: string): void { const s = new Set(this.modelSelectedIds()); s.has(id) ? s.delete(id) : s.add(id); this.modelSelectedIds.set(s); }
  toggleModelSelectAll(): void { this.modelAllSelected() ? this.modelSelectedIds.set(new Set()) : this.modelSelectedIds.set(new Set(this.filteredModelos().map(m => m.id))); }
  clearModelSelection(): void  { this.modelSelectedIds.set(new Set()); }

  editingModelo        = signal<Modelo | null>(null);
  modeloToDelete       = signal<Modelo | null>(null);
  modelFormDescription = signal('');
  modelFormError       = signal<string | null>(null);
  modelFormState       = signal<DialogState>(null);
  modelDeleteState     = signal<DialogState>(null);
  modelSaving          = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  override ngOnInit(): void { this.loadGridPrefs(); this.load(); this.loadBrands(); }

  protected override load(): void {
    this.loading.set(true); this.error.set(null);
    this.http.get<Material[]>(TIPOS_MAT_API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar los tipos de material.'); this.loading.set(false); },
    });
  }

  private loadBrands(): void {
    this.http.get<Brand[]>(BRANDS_API).subscribe({ next: data => this.brands.set(data) });
  }

  // ── Top panel actions ─────────────────────────────────────────────────────────
  selectMaterial(material: Material): void {
    if (this.selectedMaterial()?.id === material.id) {
      this.selectedMaterial.set(null);
      this.allAssocs.set([]); this.assocSelectedIds.set(new Set());
      this.selectedAssocMarca.set(null);
      this.allModelos.set([]); this.modelSelectedIds.set(new Set());
    } else {
      this.selectedMaterial.set(material);
      this.assocSearchInput.set(''); this.assocSelectedIds.set(new Set());
      this.selectedAssocMarca.set(null);
      this.allModelos.set([]); this.modelSelectedIds.set(new Set());
      this.reloadAssocs();
    }
  }

  // ── Left panel actions ────────────────────────────────────────────────────────
  reloadAssocs(): void {
    const m = this.selectedMaterial();
    if (!m) return;
    this.loadingAssocs.set(true); this.assocsError.set(null);
    this.http.get<MatMarca[]>(`${MAT_MARCAS_API}?tipoMaterialId=${m.id}`).subscribe({
      next:  data => { this.allAssocs.set(data); this.loadingAssocs.set(false); },
      error: ()   => { this.assocsError.set('Error al cargar las marcas asociadas.'); this.loadingAssocs.set(false); },
    });
  }

  selectAssocMarca(assoc: MatMarca): void {
    if (this.selectedAssocMarca()?.id === assoc.id) {
      this.selectedAssocMarca.set(null);
      this.allModelos.set([]); this.modelSelectedIds.set(new Set());
    } else {
      this.selectedAssocMarca.set(assoc);
      this.modelSearchInput.set(''); this.modelSelectedIds.set(new Set());
      this.reloadModelos();
    }
  }

  setAssocView(id: AssocViewId): void { this.assocView.set(id); }

  // ── Right panel actions ───────────────────────────────────────────────────────
  reloadModelos(): void {
    const assoc = this.selectedAssocMarca();
    if (!assoc) return;
    this.loadingModelos.set(true); this.modelosError.set(null);
    const tipoId = this.selectedMaterial()?.id;
    this.http.get<Modelo[]>(`${MODELOS_API}?marcaId=${assoc.marcaId}`).subscribe({
      next:  data => {
        this.allModelos.set(tipoId ? data.filter(m => m.tipoMaterialId === tipoId) : data);
        this.loadingModelos.set(false);
      },
      error: () => { this.modelosError.set('Error al cargar los modelos.'); this.loadingModelos.set(false); },
    });
  }

  setModelView(id: ModelViewId): void { this.modelView.set(id); }

  // ── Resize handlers ───────────────────────────────────────────────────────────
  onDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    const container = this.splitContainerRef()?.nativeElement;
    if (!container) return;
    const startY = event.clientY, startPct = this.topPanelPct(), h = container.getBoundingClientRect().height;
    this.zone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => this.zone.run(() => this.topPanelPct.set(Math.max(20, Math.min(70, startPct + ((e.clientY - startY) / h) * 100))));
      const onUp   = () => { this.doc.removeEventListener('mousemove', onMove); this.doc.removeEventListener('mouseup', onUp); };
      this.doc.addEventListener('mousemove', onMove);
      this.doc.addEventListener('mouseup', onUp);
    });
  }

  onVertDividerMouseDown(event: MouseEvent): void {
    event.preventDefault();
    const container = this.bottomContainerRef()?.nativeElement;
    if (!container) return;
    const startX = event.clientX, startPct = this.leftPanelPct(), w = container.getBoundingClientRect().width;
    this.zone.runOutsideAngular(() => {
      const onMove = (e: MouseEvent) => this.zone.run(() => this.leftPanelPct.set(Math.max(20, Math.min(70, startPct + ((e.clientX - startX) / w) * 100))));
      const onUp   = () => { this.doc.removeEventListener('mousemove', onMove); this.doc.removeEventListener('mouseup', onUp); };
      this.doc.addEventListener('mousemove', onMove);
      this.doc.addEventListener('mouseup', onUp);
    });
  }

  // ── Materials CRUD ────────────────────────────────────────────────────────────
  onMaterialFormStateChanged(s: string): void   { if (s === 'closed') this.materialFormState.set(null); }
  onMaterialDeleteStateChanged(s: string): void { if (s === 'closed') this.materialDeleteState.set(null); }

  openCreateMaterial(): void {
    this.editingMaterial.set(null); this.materialFormName.set(''); this.materialFormDescription.set('');
    this.materialFormError.set(null); this.materialFormState.set('open');
  }
  openEditMaterial(material: Material): void {
    this.editingMaterial.set(material); this.materialFormName.set(material.name);
    this.materialFormDescription.set(material.description ?? '');
    this.materialFormError.set(null); this.materialFormState.set('open');
  }
  openDeleteMaterial(material: Material): void { this.materialToDelete.set(material); this.materialDeleteState.set('open'); }

  private doSaveMaterial(onSuccess: (saved: Material) => void): void {
    const name = this.materialFormName().trim();
    if (!name) { this.materialFormError.set('El nombre es obligatorio.'); return; }
    const body: MaterialRequest = { name, description: this.materialFormDescription().trim() || null };
    this.materialSaving.set(true); this.materialFormError.set(null);
    const editing = this.editingMaterial();
    (editing ? this.http.put<Material>(`${TIPOS_MAT_API}/${editing.id}`, body) : this.http.post<Material>(TIPOS_MAT_API, body)).subscribe({
      next:  saved => { this.materialSaving.set(false); this.load(); onSuccess(saved); },
      error: ()    => { this.materialFormError.set('Error al guardar. Inténtalo de nuevo.'); this.materialSaving.set(false); },
    });
  }

  saveMaterial(): void         { this.doSaveMaterial(() => this.materialFormState.set('closed')); }
  saveMaterialAndNext(): void  { this.doSaveMaterial(() => { this.materialFormName.set(''); this.materialFormDescription.set(''); this.materialFormError.set(null); }); }
  saveMaterialAndForm(): void  { this.doSaveMaterial(saved => { this.materialFormState.set('closed'); this.router.navigate(['/inventory/materials', saved.id]); }); }
  goToForm(material: Material): void { this.router.navigate(['/inventory/materials', material.id]); }

  confirmDeleteMaterial(): void {
    const m = this.materialToDelete(); if (!m) return;
    this.http.delete(`${TIPOS_MAT_API}/${m.id}`).subscribe({
      next: () => {
        this.materialDeleteState.set('closed');
        if (this.selectedMaterial()?.id === m.id) {
          this.selectedMaterial.set(null); this.allAssocs.set([]);
          this.selectedAssocMarca.set(null); this.allModelos.set([]);
        }
        this.load();
      },
      error: () => { this.materialDeleteState.set('closed'); this.error.set('Error al eliminar el tipo de material.'); },
    });
  }

  // ── Associations CRUD ─────────────────────────────────────────────────────────
  onAssocFormStateChanged(s: string): void   { if (s === 'closed') this.assocFormState.set(null); }
  onAssocDeleteStateChanged(s: string): void { if (s === 'closed') this.assocDeleteState.set(null); }

  openCreateAssoc(): void { this.assocFormMarcaId.set(''); this.assocFormError.set(null); this.assocFormState.set('open'); }
  openDeleteAssoc(assoc: MatMarca): void { this.assocToDelete.set(assoc); this.assocDeleteState.set('open'); }

  private doSaveAssoc(marcaId: string, onSuccess: () => void): void {
    if (!marcaId) { this.assocFormError.set('La marca es obligatoria.'); return; }
    const material = this.selectedMaterial(); if (!material) return;
    const body: MatMarcaRequest = { tipoMaterialId: material.id, marcaId };
    this.assocSaving.set(true); this.assocFormError.set(null);
    this.http.post<MatMarca>(MAT_MARCAS_API, body).subscribe({
      next:  () => { this.assocSaving.set(false); this.reloadAssocs(); onSuccess(); },
      error: () => { this.assocFormError.set('Error al guardar. Puede que esta combinación ya exista.'); this.assocSaving.set(false); },
    });
  }

  saveAssoc(): void        { this.doSaveAssoc(this.assocFormMarcaId(), () => this.assocFormState.set('closed')); }
  saveAssocAndNext(): void { this.doSaveAssoc(this.assocFormMarcaId(), () => { this.assocFormMarcaId.set(''); this.assocFormError.set(null); }); }

  confirmDeleteAssoc(): void {
    const assoc = this.assocToDelete(); if (!assoc) return;
    this.http.delete(`${MAT_MARCAS_API}/${assoc.id}`).subscribe({
      next: () => {
        this.assocDeleteState.set('closed');
        if (this.selectedAssocMarca()?.id === assoc.id) {
          this.selectedAssocMarca.set(null); this.allModelos.set([]); this.modelSelectedIds.set(new Set());
        }
        this.reloadAssocs();
      },
      error: () => { this.assocDeleteState.set('closed'); this.assocsError.set('Error al eliminar la asociación.'); },
    });
  }

  // ── Models CRUD ───────────────────────────────────────────────────────────────
  onModelFormStateChanged(s: string): void   { if (s === 'closed') this.modelFormState.set(null); }
  onModelDeleteStateChanged(s: string): void { if (s === 'closed') this.modelDeleteState.set(null); }

  openCreateModelo(): void {
    this.editingModelo.set(null); this.modelFormDescription.set('');
    this.modelFormError.set(null); this.modelFormState.set('open');
  }
  openEditModelo(modelo: Modelo): void {
    this.editingModelo.set(modelo); this.modelFormDescription.set(modelo.description ?? '');
    this.modelFormError.set(null); this.modelFormState.set('open');
  }
  openDeleteModelo(modelo: Modelo): void { this.modeloToDelete.set(modelo); this.modelDeleteState.set('open'); }

  private doSaveModelo(onSuccess: () => void): void {
    const assoc    = this.selectedAssocMarca(); if (!assoc) return;
    const material = this.selectedMaterial();   if (!material) return;
    const body: ModeloRequest = {
      tipoMaterialId: material.id, marcaId: assoc.marcaId,
      description: this.modelFormDescription().trim() || null,
    };
    this.modelSaving.set(true); this.modelFormError.set(null);
    const editing = this.editingModelo();
    (editing ? this.http.put<Modelo>(`${MODELOS_API}/${editing.id}`, body) : this.http.post<Modelo>(MODELOS_API, body)).subscribe({
      next:  () => { this.modelSaving.set(false); this.reloadModelos(); onSuccess(); },
      error: () => { this.modelFormError.set('Combinación no registrada o error al guardar.'); this.modelSaving.set(false); },
    });
  }

  saveModelo(): void        { this.doSaveModelo(() => this.modelFormState.set('closed')); }
  saveModeloAndNext(): void { this.doSaveModelo(() => { this.modelFormDescription.set(''); this.modelFormError.set(null); }); }

  confirmDeleteModelo(): void {
    const m = this.modeloToDelete(); if (!m) return;
    this.http.delete(`${MODELOS_API}/${m.id}`).subscribe({
      next:  () => { this.modelDeleteState.set('closed'); this.reloadModelos(); },
      error: () => { this.modelDeleteState.set('closed'); this.modelosError.set('Error al eliminar el modelo.'); },
    });
  }
}
