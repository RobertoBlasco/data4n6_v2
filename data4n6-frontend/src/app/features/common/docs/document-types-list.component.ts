import {
  ChangeDetectionStrategy, Component, ElementRef, OnInit, effect, signal, viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  lucideFileText, lucideTrash2, lucidePlus,
  lucideRefreshCw, lucideDownload, lucideExternalLink,
  lucideLayoutList, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { GridBase } from '../../../shared/grid/grid-base';

const API = 'http://localhost:8080/api/v1/catalog/document-types';
type DialogState = 'open' | 'closed' | null;

interface DocumentType { id: string; name: string | null; description: string | null; active: boolean; }

@Component({
  selector: 'app-document-types-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgClass,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmTableImports, HlmSpinnerImports, HlmIconImports,
    BrnDialogContent, HlmDialogImports,
  ],
  providers: [provideIcons({
    lucideFileText, lucideTrash2, lucidePlus,
    lucideRefreshCw, lucideDownload, lucideExternalLink,
    lucideLayoutList, lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
  })],
  template: `
    <div [class]="containerCls">

      <!-- Cabecera -->
      <div [class]="toolbarCls">
        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            <ng-icon hlmIcon size="sm" name="lucideFileText" />{{ gridTitle() }}
          </h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Recargar" (click)="reload()">
              <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Nuevo tipo" (click)="openCreate()">
              <ng-icon hlmIcon size="sm" name="lucidePlus" />
            </button>
          </div>
        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15"
              (click)="openDelete(singleSelected()!)">
              <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
            </button>
            @if (selectionCount() === 1) {
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                (click)="openEdit(singleSelected()!)">
                <ng-icon hlmIcon size="sm" name="lucideExternalLink" class="mr-1" />Ir formulario
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

      <!-- Buscador -->
      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch" class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar..." [value]="searchInput()" (input)="onSearchInput($any($event.target).value)" />
          @if (searchInput()) {
            <button class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground" (click)="clearSearch()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          }
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-auto min-h-0">
        @if (loading()) { <div class="flex items-center justify-center py-12"><hlm-spinner /></div> }
        @if (error() && !loading()) {
          <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
        }
        @if (!loading() && !error() && totalRecords() === 0) {
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <ng-icon hlmIcon size="lg" name="lucideFileText" class="opacity-25" />
            <p class="text-sm">{{ searchQuery() ? 'Sin resultados' : 'No hay tipos registrados' }}</p>
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
                <th hlmTh class="w-40 cursor-pointer select-none" (click)="toggleSort('name', $event)">
                  <div class="flex items-center gap-1">Nombre
                    @if (sortDir('name') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('name') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('description', $event)">
                  <div class="flex items-center gap-1">Descripción
                    @if (sortDir('description') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('description') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-16 text-center">Activo</th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (item of pageItems(); track item.id; let odd = $odd) {
                <tr hlmTr
                  [class.bg-action/25]="selectedIds().has(item.id)"
                  [ngClass]="[odd && !selectedIds().has(item.id) ? rowStripeClass : '', rowHoverClass]">
                  <td hlmTd class="pr-0">
                    <input type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="selectedIds().has(item.id)"
                      (click)="toggleSelectRange(item.id, $index, $event)" />
                  </td>
                  <td hlmTd class="text-xs">{{ item.name ?? '—' }}</td>
                  <td hlmTd class="text-xs">{{ item.description ?? '—' }}</td>
                  <td hlmTd class="text-center text-xs">{{ item.active ? '✓' : '' }}</td>
                </tr>
              }
            </tbody>
          </table>
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
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() === 0" (click)="setPage(0)"><ng-icon hlmIcon size="sm" name="lucideChevronsLeft" /></button>
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() === 0" (click)="setPage(currentPage() - 1)"><ng-icon hlmIcon size="sm" name="lucideChevronLeft" /></button>
            @for (p of pageNumbers(); track p) {
              @if (p === '...') { <span class="px-1">…</span> }
              @else { <button hlmBtn [variant]="p === currentPage() + 1 ? 'default' : 'ghost'" size="icon" class="size-6 text-xs" (click)="setPage(+p - 1)">{{ p }}</button> }
            }
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() >= totalPages() - 1" (click)="setPage(currentPage() + 1)"><ng-icon hlmIcon size="sm" name="lucideChevronRight" /></button>
            <button hlmBtn variant="ghost" size="icon" class="size-6" [disabled]="currentPage() >= totalPages() - 1" (click)="setPage(totalPages() - 1)"><ng-icon hlmIcon size="sm" name="lucideChevronsRight" /></button>
          </div>
        </div>
      }
    </div>

    <!-- Diálogo alta/edición -->
    <hlm-dialog [state]="formState()" (stateChanged)="onFormState($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-sm" [showCloseButton]="false">
          <div class="bg-[#005a3b] text-white flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-4 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideFileText" />
            <h2 class="text-sm font-semibold">{{ editItem() ? 'Editar tipo' : 'Nuevo tipo de documento' }}</h2>
          </div>
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label hlmLabel>Nombre <span class="text-destructive">*</span></label>
              <input hlmInput class="w-full" [(ngModel)]="formName" placeholder="Nombre del tipo..." />
            </div>
            <div class="space-y-1.5">
              <label hlmLabel>Descripción</label>
              <input hlmInput class="w-full" [(ngModel)]="formDesc" placeholder="Descripción opcional..." />
            </div>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" [(ngModel)]="formActive" class="accent-primary" />
              Activo
            </label>
          </div>
          <div hlmDialogFooter class="gap-2 mt-4">
            <button hlmBtn variant="outline" [class]="btnDestructiveCls" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline" class="border-[#005a3b] text-[#005a3b]" [disabled]="saving()" (click)="saveAndNew()">Alta + Siguiente</button>
            <button hlmBtn [disabled]="saving()" (click)="save()">
              @if (saving()) { <hlm-spinner class="mr-1" /> } Alta
            </button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>

    <!-- Diálogo borrar -->
    <hlm-dialog [state]="deleteState()" (stateChanged)="onDeleteState($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-sm" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideTrash2" />
            <h2 class="text-sm font-semibold">¿Eliminar tipo?</h2>
          </div>
          <p class="text-sm py-2">Se eliminará <strong>{{ deleteItem()?.name }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline" [class]="btnDestructiveCls" (click)="confirmDelete()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class DocumentTypesListComponent extends GridBase<DocumentType> implements OnInit {
  protected override readonly gridId        = 'common-document-types';
  protected override readonly labelSingular = 'Tipo de documento';
  protected override readonly labelPlural   = 'Tipos de documento';
  protected override readonly icon          = 'lucideFileText';
  protected override readonly colMetaTableName = 't200_documents';

  private readonly selectAllCbRef = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');

  constructor() {
    super();
    effect(() => {
      const el = this.selectAllCbRef()?.nativeElement;
      if (el) el.indeterminate = this.someSelected();
    });
  }

  readonly formState   = signal<DialogState>(null);
  readonly deleteState = signal<DialogState>(null);
  readonly editItem    = signal<DocumentType | null>(null);
  readonly deleteItem  = signal<DocumentType | null>(null);
  readonly saving      = signal(false);

  formName   = '';
  formDesc   = '';
  formActive = true;

  override ngOnInit(): void {
    this.loadGridPrefs();
    this.sortCriteria.set([{ field: 'name', dir: 'asc' }]);
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<DocumentType[]>(API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar los tipos'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.editItem.set(null);
    this.formName = ''; this.formDesc = ''; this.formActive = true;
    this.formState.set('open');
  }

  openEdit(item: DocumentType): void {
    this.editItem.set(item);
    this.formName = item.name ?? ''; this.formDesc = item.description ?? ''; this.formActive = item.active;
    this.formState.set('open');
  }

  openDelete(item: DocumentType): void { this.deleteItem.set(item); this.deleteState.set('open'); }

  onFormState(s: string): void   { if (s === 'closed') this.formState.set(null); }
  onDeleteState(s: string): void { if (s === 'closed') this.deleteState.set(null); }

  saveAndNew(): void { this.doSave(() => this.openCreate()); }
  save(): void       { this.doSave(() => this.formState.set('closed')); }

  private doSave(onSuccess: () => void): void {
    if (!this.formName.trim()) return;
    this.saving.set(true);
    const body = { name: this.formName.trim(), description: this.formDesc.trim() || null, active: this.formActive };
    const req = this.editItem()
      ? this.http.put<DocumentType>(`${API}/${this.editItem()!.id}`, body)
      : this.http.post<DocumentType>(API, body);
    req.subscribe({
      next: () => { this.saving.set(false); this.load(); onSuccess(); },
      error: () => this.saving.set(false),
    });
  }

  confirmDelete(): void {
    const item = this.deleteItem();
    if (!item) return;
    this.http.delete(`${API}/${item.id}`).subscribe({
      next: () => { this.deleteState.set('closed'); this.load(); },
    });
  }
}
