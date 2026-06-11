import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import {
  lucideLogIn, lucidePlus, lucidePencil, lucideTrash2,
  lucideRefreshCw, lucideDownload,
  lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { ApiService } from '../../../core/services/api.service';
import { GridDialogBase } from '../../../shared/grid/grid-dialog-base';

interface TipoEntrada { id: string; nombre: string; descripcionCorta: string; descripcion: string | null; }

@Component({
  selector: 'app-entry-types',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgClass,
    BrnDialogContent, HlmDialogImports,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmTableImports, HlmSpinnerImports, HlmIconImports,
  ],
  providers: [provideIcons({
    lucideLogIn, lucidePlus, lucidePencil, lucideTrash2,
    lucideRefreshCw, lucideDownload,
    lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0 overflow-hidden rounded-lg border-2 border-primary bg-background">

      <!-- Toolbar -->
      <div [class]="toolbarCls">
        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            <ng-icon hlmIcon size="sm" name="lucideLogIn" />{{ labelPlural }}
          </h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Recargar" (click)="reload()">
              <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
            </button>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Exportar">
              <ng-icon hlmIcon size="sm" name="lucideDownload" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Nuevo tipo" (click)="openCreate()">
              <ng-icon hlmIcon size="sm" name="lucidePlus" />
            </button>
          </div>
        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15">
              <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
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
            placeholder="Buscar en tipos de entrada..."
            [value]="searchInput()" (input)="onSearchInput($any($event.target).value)" />
          @if (searchInput()) {
            <button class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground" (click)="clearSearch()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          }
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-auto min-h-0">
        @if (loading()) {
          <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
        }
        @if (error() && !loading()) {
          <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && searchQuery()) {
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <ng-icon hlmIcon size="lg" name="lucideSearch" class="opacity-25" />
            <p class="text-sm">Sin resultados para "{{ searchQuery() }}"</p>
            <button hlmBtn variant="outline" size="sm" (click)="clearSearch()">Limpiar búsqueda</button>
          </div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <ng-icon hlmIcon size="lg" name="lucideLogIn" class="opacity-25" />
            <p class="text-sm">No hay tipos de entrada</p>
            <button hlmBtn variant="outline" size="sm" (click)="openCreate()">
              <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir el primero
            </button>
          </div>
        }
        @if (!loading() && !error() && totalRecords() > 0) {
          <table hlmTable class="w-full">
            <thead hlmTHead [ngClass]="headerColor">
              <tr hlmTr>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('nombre', $event)">
                  <div class="flex items-center gap-1">Nombre
                    @if (sortDir('nombre') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('nombre') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-36 cursor-pointer select-none" (click)="toggleSort('descripcionCorta', $event)">
                  <div class="flex items-center gap-1">Abrev.
                    @if (sortDir('descripcionCorta') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('descripcionCorta') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh>Descripción</th>
                <th hlmTh class="w-20 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (item of pageItems(); track item.id; let odd = $odd) {
                <tr hlmTr [ngClass]="[odd ? rowStripeClass : '', rowHoverClass]">
                  <td hlmTd>{{ item.nombre }}</td>
                  <td hlmTd><code class="text-xs font-mono text-primary">{{ item.descripcionCorta }}</code></td>
                  <td hlmTd>{{ item.descripcion ?? '—' }}</td>
                  <td hlmTd class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button hlmBtn variant="ghost" size="icon" class="size-6" (click)="openEdit(item)">
                        <ng-icon hlmIcon size="sm" name="lucidePencil" /><span class="sr-only">Editar</span>
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" (click)="openDelete(item)">
                        <ng-icon hlmIcon size="sm" name="lucideTrash2" /><span class="sr-only">Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Footer -->
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

    <!-- Diálogo alta / edición -->
    <hlm-dialog [state]="formState()" (stateChanged)="onFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-md" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-4 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideLogIn" />
            <h2 class="text-sm font-semibold">{{ editingItem() ? 'Editar tipo de entrada' : 'Nuevo tipo de entrada' }}</h2>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label hlmLabel>Nombre <span class="text-destructive">*</span></label>
              <input hlmInput class="w-full" placeholder="Nombre del tipo de entrada" [ngModel]="formNombre()" (ngModelChange)="formNombre.set($event)" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label hlmLabel>Abreviatura <span class="text-destructive">*</span> <span class="text-muted-foreground font-normal">(máx. 10 caracteres)</span></label>
              <input hlmInput class="w-full" placeholder="Ej: ENT" maxlength="10"
                [ngModel]="formDescripcionCorta()" (ngModelChange)="formDescripcionCorta.set($event)" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label hlmLabel>Descripción</label>
              <input hlmInput class="w-full" placeholder="Descripción opcional" [ngModel]="formDescripcion()" (ngModelChange)="formDescripcion.set($event)" />
            </div>
            @if (formError()) {
              <p class="text-xs text-destructive">{{ formError() }}</p>
            }
          </div>

          <div hlmDialogFooter class="mt-4">
            <button hlmBtn variant="outline"
              class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white"
              hlmDialogClose [disabled]="saving()">Cancelar</button>
            @if (!editingItem()) {
              <button hlmBtn variant="default" [disabled]="saving() || !formNombre() || !formDescripcionCorta()" (click)="saveAndNext()">
                Alta + Siguiente
              </button>
            }
            <button hlmBtn variant="default" [disabled]="saving() || !formNombre() || !formDescripcionCorta()" (click)="save()">
              {{ saving() ? 'Guardando…' : (editingItem() ? 'Guardar' : 'Alta') }}
            </button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- Diálogo confirmación borrado -->
    <hlm-dialog [state]="deleteState()" (stateChanged)="onDeleteStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-sm" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-4 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideTrash2" />
            <h2 class="text-sm font-semibold">Eliminar tipo de entrada</h2>
          </div>
          <p class="text-sm">
            ¿Eliminar <span class="font-semibold text-foreground">{{ itemToDelete()?.nombre }}</span>? Esta acción no se puede deshacer.
          </p>
          <div hlmDialogFooter class="mt-4">
            <button hlmBtn variant="outline"
              class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white"
              hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline" [class]="btnDestructiveCls" (click)="confirmDelete()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class EntryTypesComponent extends GridDialogBase<TipoEntrada> implements OnInit {
  protected override readonly gridId        = 'inventory-entry-types';
  protected override readonly labelSingular = 'Tipo de entrada';
  protected override readonly labelPlural   = 'Tipos de entrada';
  protected override readonly icon          = 'lucideLogIn';

  private readonly api = inject(ApiService);

  readonly formNombre          = signal('');
  readonly formDescripcionCorta = signal('');
  readonly formDescripcion     = signal('');

  override ngOnInit(): void { this.loadGridPrefs(); this.load(); }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<TipoEntrada[]>('/inventory/entry-types').subscribe({
      next:  items => { this.allItems.set(items); this.loading.set(false); },
      error: ()    => { this.error.set('Error al cargar los tipos de entrada.'); this.loading.set(false); },
    });
  }

  override openCreate(): void {
    super.openCreate();
    this.formNombre.set('');
    this.formDescripcionCorta.set('');
    this.formDescripcion.set('');
  }

  override openEdit(item: TipoEntrada): void {
    super.openEdit(item);
    this.formNombre.set(item.nombre);
    this.formDescripcionCorta.set(item.descripcionCorta);
    this.formDescripcion.set(item.descripcion ?? '');
  }

  save(): void { this.doSave(true); }
  saveAndNext(): void { this.doSave(false); }

  private doSave(close: boolean): void {
    const body = {
      nombre:           this.formNombre(),
      descripcionCorta: this.formDescripcionCorta(),
      descripcion:      this.formDescripcion() || null,
    };
    const existing = this.editingItem();
    const req$ = existing
      ? this.api.put<TipoEntrada>(`/inventory/entry-types/${existing.id}`, body)
      : this.api.post<TipoEntrada>('/inventory/entry-types', body);

    this.saving.set(true);
    this.formError.set(null);
    req$.subscribe({
      next: saved => {
        this.allItems.update(list =>
          existing ? list.map(t => t.id === saved.id ? saved : t) : [...list, saved]
        );
        this.saving.set(false);
        if (close) {
          this.formState.set(null);
        } else {
          this.formNombre.set('');
          this.formDescripcionCorta.set('');
          this.formDescripcion.set('');
          this.editingItem.set(null);
        }
      },
      error: () => { this.formError.set('Error al guardar. Inténtalo de nuevo.'); this.saving.set(false); },
    });
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.api.delete(`/inventory/entry-types/${item.id}`).subscribe({
      next:  () => { this.allItems.update(list => list.filter(t => t.id !== item.id)); this.deleteState.set(null); },
      error: () => { this.deleteState.set(null); },
    });
  }
}
