import {
  ChangeDetectionStrategy, Component, ElementRef,
  OnInit, effect, signal, viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import {
  lucideLayers, lucidePlus, lucideRefreshCw, lucideDownload,
  lucideLayoutList, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
  lucideExternalLink, lucideTrash2,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { GridBase } from '../../../shared/grid/grid-base';

const API = 'http://localhost:8080/api/v1/catalog/table-fields';

interface TableField {
  id: string;
  appTableId: string | null;
  fieldName: string | null;
  displayName: string | null;
  fieldType: string | null;
  required: boolean;
  visibleInGrid: boolean;
  visibleInForm: boolean;
  orden: number | null;
}

@Component({
  selector: 'app-table-fields-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, HlmButtonImports, HlmTableImports, HlmSpinnerImports, HlmIconImports],
  providers: [provideIcons({
    lucideLayers, lucidePlus, lucideRefreshCw, lucideDownload,
    lucideLayoutList, lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideExternalLink, lucideTrash2,
  })],
  template: `
    <div [class]="containerCls">

      <div [class]="toolbarCls">
        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5"><ng-icon hlmIcon size="sm" name="lucideLayers" />{{ gridTitle() }}</h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" (click)="reload()"><ng-icon hlmIcon size="sm" name="lucideRefreshCw" /></button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Nuevo">
              <ng-icon hlmIcon size="sm" name="lucidePlus" />
            </button>
          </div>
        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15"><ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar</button>
            @if (selectionCount() === 1) {
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"><ng-icon hlmIcon size="sm" name="lucideExternalLink" class="mr-1" />Ir formulario</button>
            }
            <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"><ng-icon hlmIcon size="sm" name="lucideDownload" class="mr-1" />Exportar</button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" (click)="clearSelection()"><ng-icon hlmIcon size="sm" name="lucideX" /></button>
          </div>
        }
      </div>

      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch" class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar campo..." [value]="searchInput()" (input)="onSearchInput($any($event.target).value)" />
          @if (searchInput()) {
            <button class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground" (click)="clearSearch()"><ng-icon hlmIcon size="sm" name="lucideX" /></button>
          }
        </div>
      </div>

      <div class="flex-1 overflow-auto min-h-0">
        @if (loading()) { <div class="flex items-center justify-center py-12"><hlm-spinner /></div> }
        @if (error() && !loading()) { <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div> }
        @if (!loading() && !error() && totalRecords() === 0) {
          <div class="flex flex-col items-center justify-center py-12 gap-3">
            <ng-icon hlmIcon size="lg" name="lucideLayers" class="opacity-25" />
            <p class="text-sm">{{ searchQuery() ? 'Sin resultados' : 'No hay campos registrados' }}</p>
          </div>
        }
        @if (!loading() && !error() && totalRecords() > 0) {
          <table hlmTable class="w-full">
            <thead hlmTHead [ngClass]="headerColor">
              <tr hlmTr>
                <th hlmTh class="w-8 pr-0"><input #selectAllCb type="checkbox" class="accent-primary cursor-pointer" [checked]="allSelected()" (change)="toggleSelectAll()" /></th>
                <th hlmTh class="w-40 cursor-pointer select-none" (click)="toggleSort('fieldName', $event)">
                  <div class="flex items-center gap-1">Campo
                    @if (sortDir('fieldName') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('fieldName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('displayName', $event)">
                  <div class="flex items-center gap-1">Nombre visible
                    @if (sortDir('displayName') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('displayName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-28 cursor-pointer select-none" (click)="toggleSort('fieldType', $event)">
                  <div class="flex items-center gap-1">Tipo
                    @if (sortDir('fieldType') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('fieldType') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-16 text-center">Req.</th>
                <th hlmTh class="w-16 text-center">Grid</th>
                <th hlmTh class="w-16 text-center">Form</th>
                <th hlmTh class="w-14 text-right cursor-pointer select-none" (click)="toggleSort('orden', $event)">
                  <div class="flex items-center justify-end gap-1">Orden
                    @if (sortDir('orden') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('orden') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (f of pageItems(); track f.id; let odd = $odd) {
                <tr hlmTr [class.bg-action/25]="selectedIds().has(f.id)"
                  [ngClass]="[odd && !selectedIds().has(f.id) ? rowStripeClass : '', rowHoverClass]">
                  <td hlmTd class="pr-0"><input type="checkbox" class="accent-primary cursor-pointer" [checked]="selectedIds().has(f.id)" (click)="toggleSelectRange(f.id, $index, $event)" /></td>
                  <td hlmTd class="font-mono text-xs">{{ f.fieldName ?? '—' }}</td>
                  <td hlmTd class="text-xs">{{ f.displayName ?? '—' }}</td>
                  <td hlmTd class="text-xs">{{ f.fieldType ?? '—' }}</td>
                  <td hlmTd class="text-center text-xs">{{ f.required ? '✓' : '' }}</td>
                  <td hlmTd class="text-center text-xs">{{ f.visibleInGrid ? '✓' : '' }}</td>
                  <td hlmTd class="text-center text-xs">{{ f.visibleInForm ? '✓' : '' }}</td>
                  <td hlmTd class="text-right tabular-nums text-xs">{{ f.orden ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      @if (!loading() && !error() && totalRecords() > 0) {
        <div [class]="footerCls">
          <span>{{ displayFrom() }}–{{ displayTo() }} / {{ totalRecords() }}</span>
          <div class="flex items-center gap-0.5">
            <select class="h-6 rounded border border-input bg-background px-1 text-xs focus:outline-none cursor-pointer" [value]="pageSize()" (change)="setPageSize(+$any($event.target).value)">
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
  `,
})
export class TableFieldsListComponent extends GridBase<TableField> implements OnInit {
  protected override readonly gridId        = 'security-table-fields';
  protected override readonly labelSingular = 'Campo';
  protected override readonly labelPlural   = 'Campos';
  protected override readonly icon          = 'lucideLayers';
  protected override readonly colMetaTableName = 't900_table_fields';

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
    this.sortCriteria.set([{ field: 'fieldName', dir: 'asc' }]);
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<TableField[]>(API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar los campos'); this.loading.set(false); },
    });
  }
}
