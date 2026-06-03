import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  effect,
  signal,
  viewChild,
  inject,
  NgZone,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, DOCUMENT } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePencil, lucideTrash2, lucidePlus, lucideCalendar,
  lucideRefreshCw, lucideDownload, lucideUpload,
  lucideLayoutList, lucideLayoutGrid, lucideTable2, lucidePanelsLeftRight,
  lucideSlidersHorizontal, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
  lucideArrowRight,
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

interface Evento {
  id: string;
  nombre: string;
  descripcionCorta: string | null;
  descripcion: string;
  estadoId: string | null;
  estadoNombre: string | null;
}

interface EventoRequest {
  nombre: string;
  descripcionCorta: string | null;
  descripcion: string;
  estadoId: string | null;
}

interface Estado {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface EventoTransicion {
  id: string;
  eventoOrigenId: string;
  eventoOrigenNombre: string;
  eventoDestinoId: string;
  eventoDestinoNombre: string;
}

const API          = 'http://localhost:8080/api/v1/inventory/eventos';
const ESTADOS_API  = 'http://localhost:8080/api/v1/inventory/estados';
const TRANS_API    = 'http://localhost:8080/api/v1/inventory/evento-transiciones';
type DialogState = 'open' | 'closed' | null;

@Component({
  selector: 'app-eventos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgClass,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmTableImports, BrnDialogContent, HlmDialogImports,
    HlmSpinnerImports, HlmIconImports, HlmTooltipImports,
  ],
  providers: [provideIcons({
    lucidePencil, lucideTrash2, lucidePlus, lucideCalendar,
    lucideRefreshCw, lucideDownload, lucideUpload,
    lucideLayoutList, lucideLayoutGrid, lucideTable2, lucidePanelsLeftRight,
    lucideSlidersHorizontal, lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideArrowRight,
  })],
  template: `
    <!-- ── Contenedor principal: dos paneles redimensionables ──────────────── -->
    <div class="h-full flex flex-col min-h-0 gap-0 overflow-hidden" #splitContainer>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- Panel superior — Rejilla de eventos                                 -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col min-h-0 rounded-t-lg border-2 border-primary bg-background overflow-hidden"
           [style.height.%]="topPanelPct()">

        <!-- ── Cabecera ────────────────────────────────────────────────────── -->
        <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">

          @if (selectionCount() === 0) {
            <h1 class="text-sm font-semibold flex items-center gap-1.5">
              <ng-icon hlmIcon size="sm" name="lucideCalendar" />{{ labelPlural }}
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
                <button
                  hlmBtn variant="ghost" size="icon"
                  class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  [class.bg-primary-foreground/20]="showViewPicker()"
                  title="Cambiar Vista"
                  (click)="toggleViewPicker()"
                >
                  <ng-icon hlmIcon size="sm" [name]="activeView().icon" />
                </button>
                @if (showViewPicker()) {
                  <div class="fixed inset-0 z-40" (click)="showViewPicker.set(false)"></div>
                  <div class="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
                    @for (view of gridViews; track view.id) {
                      <button
                        class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-left"
                        [class.font-semibold]="activeView().id === view.id"
                        (click)="setView(view)"
                      >
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
              <button
                hlmBtn variant="ghost" size="icon"
                class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                [class.bg-primary-foreground/20]="showAdvancedFilters()"
                title="Filtros avanzados"
                (click)="showAdvancedFilters.set(!showAdvancedFilters())"
              >
                <ng-icon hlmIcon size="sm" name="lucideSlidersHorizontal" />
              </button>
              <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
              <button hlmBtn variant="action" size="sm" class="h-7" (click)="openCreate()">
                <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />
                Nuevo {{ labelSingular }}
              </button>
            </div>

          } @else {
            <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
            <div class="flex items-center gap-0.5">
              <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
              </button>
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

        <!-- ── Buscador ────────────────────────────────────────────────────── -->
        <div class="px-3 py-2 shrink-0 border-b border-border">
          <div class="relative">
            <ng-icon hlmIcon size="sm" name="lucideSearch"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              [placeholder]="'Buscar en ' + labelPlural.toLowerCase() + '...'"
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

        <!-- ── Filtros avanzados ───────────────────────────────────────────── -->
        @if (showAdvancedFilters()) {
          <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
            <p class="text-xs text-muted-foreground italic">Sin filtros avanzados para esta rejilla</p>
          </div>
        }

        <!-- ── Tabla / tarjetas ────────────────────────────────────────────── -->
        <div class="flex-1 overflow-auto min-h-0">

          @if (loading()) {
            <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
          }
          @if (error() && !loading()) {
            <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
          }
          @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ng-icon hlmIcon size="lg" [name]="icon" class="opacity-25" />
              <p class="text-sm">No hay {{ labelPlural.toLowerCase() }} registrados</p>
              <button hlmBtn variant="outline" size="sm" (click)="openCreate()">
                <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primer {{ labelSingular.toLowerCase() }}
              </button>
            </div>
          }
          @if (!loading() && !error() && totalRecords() === 0 && searchQuery()) {
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
              <p class="text-sm">Sin resultados para "{{ searchQuery() }}"</p>
              <button hlmBtn variant="outline" size="sm" (click)="clearSearch()">Limpiar búsqueda</button>
            </div>
          }

          @if (!loading() && !error() && totalRecords() > 0) {

            @if (activeView().id === 'CARD') {
              <div class="grid gap-3 p-4" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))">
                @for (evento of pageItems(); track evento.id) {
                  <div
                    class="group flex flex-col rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                    [class.border-primary]="selectedEvento()?.id === evento.id"
                    [class.bg-primary/5]="selectedEvento()?.id === evento.id"
                    [class.border-border]="selectedEvento()?.id !== evento.id"
                    (click)="selectEvento(evento)"
                  >
                    <div class="flex items-start gap-1.5 mb-1.5">
                      <ng-icon hlmIcon [name]="icon" size="sm" class="text-primary shrink-0 mt-0.5" />
                      <span class="font-semibold text-xs leading-tight truncate">{{ evento.nombre }}</span>
                    </div>
                    @if (evento.descripcionCorta) {
                      <span class="font-mono text-[10px] text-muted-foreground mb-1">{{ evento.descripcionCorta }}</span>
                    }
                    @if (evento.descripcion) {
                      <p class="text-[10px] text-muted-foreground line-clamp-2 flex-1">{{ evento.descripcion }}</p>
                    }
                    <div class="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" (click)="$event.stopPropagation()">
                      <button hlmBtn variant="ghost" size="icon" class="size-5" title="Editar" (click)="openEdit(evento)">
                        <ng-icon hlmIcon size="sm" name="lucidePencil" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-5 text-destructive hover:text-destructive" title="Eliminar" (click)="openDelete(evento)">
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
                    <th hlmTh class="w-20 cursor-pointer select-none" (click)="toggleSort('descripcionCorta', $event)">
                      <div class="flex items-center gap-1">Ref.
                        @if (sortDir('descripcionCorta') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                        @else if (sortDir('descripcionCorta') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                      </div>
                    </th>
                    <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('nombre', $event)">
                      <div class="flex items-center gap-1">Nombre
                        @if (sortDir('nombre') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                        @else if (sortDir('nombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                      </div>
                    </th>
                    <th hlmTh class="w-28 cursor-pointer select-none" (click)="toggleSort('estadoNombre', $event)">
                      <div class="flex items-center gap-1">Estado
                        @if (sortDir('estadoNombre') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                        @else if (sortDir('estadoNombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                      </div>
                    </th>
                    <th hlmTh class="w-16 text-right">Acc.</th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (evento of pageItems(); track evento.id; let odd = $odd) {
                    <tr
                      hlmTr
                      class="cursor-pointer"
                      [ngClass]="[
                        (selectedEvento()?.id === evento.id || selectedIds().has(evento.id)) ? rowSelectedClass : (odd ? rowStripeClass : ''),
                        (selectedEvento()?.id !== evento.id && !selectedIds().has(evento.id)) ? rowHoverClass : ''
                      ]"
                      (click)="selectEvento(evento)"
                    >
                      <td hlmTd class="pr-0" (click)="$event.stopPropagation()">
                        <input type="checkbox" class="accent-primary cursor-pointer"
                          [checked]="selectedIds().has(evento.id)"
                          (change)="toggleSelect(evento.id)" />
                      </td>
                      <td hlmTd class="font-mono">{{ evento.descripcionCorta ?? '—' }}</td>
                      <td hlmTd>{{ evento.nombre }}</td>
                      <td hlmTd>{{ evento.estadoNombre ?? '—' }}</td>
                      <td hlmTd class="text-right" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-end gap-0.5">
                          <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEdit(evento)">
                            <ng-icon hlmIcon size="sm" name="lucidePencil" />
                          </button>
                          <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDelete(evento)">
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

        <!-- ── Pie (paginación) ────────────────────────────────────────────── -->
        @if (!loading() && !error() && totalRecords() > 0) {
          <div class="flex items-center justify-between px-3 h-10 shrink-0 border-t border-border text-xs text-muted-foreground" [ngClass]="footerColor">
            <span>{{ displayFrom() }}–{{ displayTo() }} / {{ totalRecords() }}</span>
            <div class="flex items-center gap-1">
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

      </div><!-- /panel superior -->

      <!-- ── Divisor arrastrable ────────────────────────────────────────────── -->
      <div
        class="h-1.5 shrink-0 bg-action/60 hover:bg-action cursor-row-resize transition-colors"
        (mousedown)="onDividerMouseDown($event)"
      ></div>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- Panel inferior — Transiciones del evento seleccionado              -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col min-h-0 rounded-b-lg border-2 border-primary bg-background overflow-hidden flex-1">

        <!-- Cabecera del panel de transiciones -->
        <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">
          <h2 class="text-sm font-semibold truncate">
            @if (selectedEvento()) {
              Transiciones — {{ selectedEvento()!.nombre }}
            } @else {
              Transiciones
            }
          </h2>
        </div>

        @if (!selectedEvento()) {
          <!-- Estado vacío: sin selección -->
          <div class="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground px-6 text-center">
            <ng-icon hlmIcon name="lucideArrowRight" size="lg" class="opacity-20" />
            <p class="text-sm">Selecciona un evento para ver y editar sus transiciones</p>
          </div>

        } @else {
          <!-- Añadir nueva transición -->
          <div class="px-4 py-3 shrink-0 border-b border-border bg-muted/20">
            <p class="text-xs text-muted-foreground mb-2">Evento destino que puede seguir a <strong>{{ selectedEvento()!.nombre }}</strong>:</p>
            <div class="flex gap-2">
              <select
                class="flex-1 h-8 rounded-md border border-primary bg-action/5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                [ngModel]="newDestinoId()" (ngModelChange)="newDestinoId.set($event)"
              >
                <option value="">Selecciona un evento destino...</option>
                @for (evt of availableDestinos(); track evt.id) {
                  <option [value]="evt.id">{{ evt.nombre }}</option>
                }
              </select>
              <button
                hlmBtn variant="default" size="sm" class="h-8 shrink-0"
                [disabled]="!newDestinoId() || savingTransicion()"
                (click)="addTransicion()"
              >
                @if (savingTransicion()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
                <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />
                Añadir
              </button>
            </div>
            @if (transicionError()) {
              <p class="text-xs text-destructive mt-1.5">{{ transicionError() }}</p>
            }
          </div>

          <!-- Lista de transiciones -->
          <div class="flex-1 overflow-auto min-h-0">
            @if (loadingTransiciones()) {
              <div class="flex items-center justify-center py-8"><hlm-spinner /></div>
            } @else if (transiciones().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <ng-icon hlmIcon name="lucideArrowRight" size="lg" class="opacity-20" />
                <p class="text-sm">Sin transiciones definidas</p>
              </div>
            } @else {
              <div class="divide-y divide-border">
                @for (t of transiciones(); track t.id) {
                  <div class="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors group">
                    <ng-icon hlmIcon name="lucideArrowRight" size="sm" class="text-primary shrink-0" />
                    <span class="flex-1 text-sm">{{ t.eventoDestinoNombre }}</span>
                    <button
                      hlmBtn variant="ghost" size="icon"
                      class="size-6 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar transición"
                      (click)="deleteTransicion(t.id)"
                    >
                      <ng-icon hlmIcon size="sm" name="lucideTrash2" />
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Pie del panel de transiciones -->
          <div class="px-4 h-8 shrink-0 border-t border-border flex items-center text-xs text-muted-foreground" [ngClass]="footerColor">
            {{ transiciones().length }} transición{{ transiciones().length !== 1 ? 'es' : '' }}
          </div>
        }

      </div><!-- /panel derecho -->

    </div><!-- /contenedor principal -->

    <!-- ── Formulario crear / editar ─────────────────────────────────────── -->
    <hlm-dialog [state]="formState()" (stateChanged)="onFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-lg" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideCalendar" />
            <h2 class="text-sm font-semibold">{{ editingEvento() ? 'Editar ' + labelSingular.toLowerCase() : 'Nuevo ' + labelSingular.toLowerCase() }}</h2>
          </div>
          <div class="space-y-4 py-2">
            @if (formError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ formError() }}</div>
            }
            <div class="space-y-1.5">
              <label hlmLabel for="evtNombre">Nombre <span class="text-destructive">*</span></label>
              <input hlmInput id="evtNombre" class="w-full" placeholder="Ej. Recepción de material"
                [ngModel]="formNombre()" (ngModelChange)="formNombre.set($event)" />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel for="evtRef">Referencia corta</label>
              <input hlmInput id="evtRef" class="w-full" placeholder="Ej. REC" maxlength="10"
                [ngModel]="formDescripcionCorta()" (ngModelChange)="formDescripcionCorta.set($event)" />
              <p class="text-xs text-muted-foreground">Máximo 10 caracteres</p>
            </div>
            <div class="space-y-1.5">
              <label hlmLabel for="evtDesc">Descripción <span class="text-destructive">*</span></label>
              <textarea id="evtDesc"
                class="flex min-h-[80px] w-full rounded-md border border-primary bg-action/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="Descripción del tipo de evento"
                [ngModel]="formDescripcion()" (ngModelChange)="formDescripcion.set($event)"
              ></textarea>
            </div>
            <div class="space-y-1.5">
              <label hlmLabel for="evtEstado">Estado</label>
              <select id="evtEstado"
                class="w-full h-9 rounded-md border border-primary bg-action/5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                [ngModel]="formEstadoId()" (ngModelChange)="formEstadoId.set($event)"
              >
                <option value="">Sin estado</option>
                @for (estado of estados(); track estado.id) {
                  <option [value]="estado.id">{{ estado.name }}</option>
                }
              </select>
            </div>
          </div>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose [disabled]="saving()">Cancelar</button>
            @if (!editingEvento()) {
              <button hlmBtn variant="default" (click)="saveAndNext()" [disabled]="saving()">
                @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Siguiente
              </button>
            }
            <button hlmBtn (click)="save()" [disabled]="saving()">
              @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              {{ editingEvento() ? 'Aceptar' : 'Alta' }}
            </button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- ── Confirmación de borrado ────────────────────────────────────────── -->
    <hlm-dialog [state]="deleteState()" (stateChanged)="onDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideCalendar" />
            <h2 class="text-sm font-semibold">¿Eliminar {{ labelSingular.toLowerCase() }}?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">Se eliminará <strong>{{ eventoToDelete()?.nombre }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="destructive" (click)="confirmDelete()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class EventosComponent extends GridBase<Evento> implements OnInit {
  protected override readonly gridId      = 'inventory-eventos';
  protected override readonly labelSingular = 'Evento';
  protected override readonly labelPlural   = 'Eventos';
  protected override readonly icon          = 'lucideCalendar';
  protected override readonly gridViews: GridViewDef[] = [GRID_VIEW.GRID, GRID_VIEW.GRID_DETAIL, GRID_VIEW.CARD];

  private readonly splitContainerRef = viewChild<ElementRef<HTMLElement>>('splitContainer');
  private readonly doc = inject(DOCUMENT);
  private readonly zone = inject(NgZone);

  // ── Panel resize ───────────────────────────────────────────────────────────
  topPanelPct = signal(50);

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

  // ── Lookup data ────────────────────────────────────────────────────────────
  estados = signal<Estado[]>([]);

  // ── Evento seleccionado + transiciones ─────────────────────────────────────
  selectedEvento      = signal<Evento | null>(null);
  transiciones        = signal<EventoTransicion[]>([]);
  loadingTransiciones = signal(false);
  newDestinoId        = signal('');
  savingTransicion    = signal(false);
  transicionError     = signal<string | null>(null);

  readonly availableDestinos = computed(() => {
    const sel = this.selectedEvento();
    if (!sel) return [];
    const usedIds = new Set(this.transiciones().map(t => t.eventoDestinoId));
    return this.allItems().filter(e => e.id !== sel.id && !usedIds.has(e.id));
  });

  // ── Form crear / editar ────────────────────────────────────────────────────
  editingEvento    = signal<Evento | null>(null);
  eventoToDelete   = signal<Evento | null>(null);
  formNombre          = signal('');
  formDescripcionCorta = signal('');
  formDescripcion     = signal('');
  formEstadoId        = signal('');
  formError           = signal<string | null>(null);
  formState           = signal<DialogState>(null);
  deleteState         = signal<DialogState>(null);
  saving              = signal(false);

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
    this.loadEstados();
    this.load();
  }

  private loadEstados(): void {
    this.http.get<Estado[]>(ESTADOS_API).subscribe({ next: data => this.estados.set(data) });
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Evento[]>(API).subscribe({
      next: data => { this.allItems.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar los eventos.'); this.loading.set(false); },
    });
  }

  // ── Selección de evento ────────────────────────────────────────────────────
  selectEvento(evento: Evento): void {
    if (this.selectedEvento()?.id === evento.id) {
      this.clearSelectedEvento();
    } else {
      this.selectedEvento.set(evento);
      this.loadTransiciones(evento.id);
    }
  }

  clearSelectedEvento(): void {
    this.selectedEvento.set(null);
    this.transiciones.set([]);
    this.newDestinoId.set('');
    this.transicionError.set(null);
  }

  private loadTransiciones(eventoId: string): void {
    this.loadingTransiciones.set(true);
    this.transicionError.set(null);
    this.http.get<EventoTransicion[]>(`${TRANS_API}/by-origen/${eventoId}`).subscribe({
      next: data => { this.transiciones.set(data); this.loadingTransiciones.set(false); },
      error: () => { this.loadingTransiciones.set(false); },
    });
  }

  addTransicion(): void {
    const sel = this.selectedEvento();
    const destinoId = this.newDestinoId();
    if (!sel || !destinoId) return;
    this.savingTransicion.set(true);
    this.transicionError.set(null);
    this.http.post<EventoTransicion>(TRANS_API, { eventoOrigenId: sel.id, eventoDestinoId: destinoId }).subscribe({
      next: t => {
        this.transiciones.update(list => [...list, t]);
        this.newDestinoId.set('');
        this.savingTransicion.set(false);
      },
      error: () => {
        this.transicionError.set('Error al añadir la transición.');
        this.savingTransicion.set(false);
      },
    });
  }

  deleteTransicion(id: string): void {
    this.http.delete(`${TRANS_API}/${id}`).subscribe({
      next: () => this.transiciones.update(list => list.filter(t => t.id !== id)),
      error: () => this.transicionError.set('Error al eliminar la transición.'),
    });
  }

  // ── Form CRUD evento ───────────────────────────────────────────────────────
  onFormStateChanged(state: string): void  { if (state === 'closed') this.formState.set(null); }
  onDeleteStateChanged(state: string): void { if (state === 'closed') this.deleteState.set(null); }

  openCreate(): void {
    this.editingEvento.set(null);
    this.formNombre.set(''); this.formDescripcionCorta.set('');
    this.formDescripcion.set(''); this.formEstadoId.set('');
    this.formError.set(null); this.formState.set('open');
  }

  openEdit(evento: Evento): void {
    this.editingEvento.set(evento);
    this.formNombre.set(evento.nombre);
    this.formDescripcionCorta.set(evento.descripcionCorta ?? '');
    this.formDescripcion.set(evento.descripcion);
    this.formEstadoId.set(evento.estadoId ?? '');
    this.formError.set(null); this.formState.set('open');
  }

  openDelete(evento: Evento): void {
    this.eventoToDelete.set(evento);
    this.deleteState.set('open');
  }

  private doSave(onSuccess: () => void): void {
    const nombre = this.formNombre().trim();
    const descripcion = this.formDescripcion().trim();
    if (!nombre)      { this.formError.set('El nombre es obligatorio.'); return; }
    if (!descripcion) { this.formError.set('La descripción es obligatoria.'); return; }
    const body: EventoRequest = {
      nombre, descripcion,
      descripcionCorta: this.formDescripcionCorta().trim() || null,
      estadoId: this.formEstadoId() || null,
    };
    this.saving.set(true); this.formError.set(null);
    const editing = this.editingEvento();
    const req$ = editing
      ? this.http.put<Evento>(`${API}/${editing.id}`, body)
      : this.http.post<Evento>(API, body);
    req$.subscribe({
      next: () => { this.saving.set(false); this.load(); onSuccess(); },
      error: () => { this.formError.set('Error al guardar. Inténtalo de nuevo.'); this.saving.set(false); },
    });
  }

  save(): void       { this.doSave(() => this.formState.set('closed')); }
  saveAndNext(): void {
    this.doSave(() => {
      this.formNombre.set(''); this.formDescripcionCorta.set('');
      this.formDescripcion.set(''); this.formEstadoId.set('');
      this.formError.set(null);
    });
  }

  confirmDelete(): void {
    const evento = this.eventoToDelete();
    if (!evento) return;
    this.http.delete(`${API}/${evento.id}`).subscribe({
      next: () => {
        if (this.selectedEvento()?.id === evento.id) this.clearSelectedEvento();
        this.deleteState.set('closed');
        this.load();
      },
      error: () => { this.deleteState.set('closed'); this.error.set('Error al eliminar el evento.'); },
    });
  }
}
