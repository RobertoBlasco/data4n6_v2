import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePencil, lucideTrash2, lucidePlus, lucideSettings,
  lucideRefreshCw, lucideDownload, lucideUpload, lucideExternalLink,
  lucideLayoutList, lucideSlidersHorizontal, lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
  lucideFileText, lucideRuler, lucideCheck, lucideCircleX, lucideUserCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTooltipImports } from '../../../../spartan/tooltip/src';
import { FkComboboxComponent } from '../../../../shared/components/fk-combobox/fk-combobox.component';
import { GridBase } from '../../../../shared/grid/grid-base';
import { AppTableService } from '../../../../core/services/app-table.service';
import { AppTable } from '../../../../core/models/app-table.model';
import { TableField } from '../../../../core/models/table-field.model';
import { ApiService } from '../../../../core/services/api.service';

type Row = Record<string, unknown> & { id: string };
type DialogState = 'open' | 'closed' | null;

interface ColumnDef {
  key: string;
  label: string;
  width?: number | null;
  align?: string | null;
}

interface FormFieldDef {
  key: string;
  label: string;
  endpoint?: string;
  fieldType?: string;
  required?: boolean;
  defaultValue?: string | null;
  placeholder?: string | null;
}


const SYSTEM_FIELDS = new Set([
  'id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'active', 'deleted',
]);

function deriveColumns(item: Row): ColumnDef[] {
  const keys = Object.keys(item);
  const idKeys = new Set(keys.filter(k => k.endsWith('Id')));
  return keys
    .filter(k => {
      if (SYSTEM_FIELDS.has(k)) return false;
      if (k.endsWith('Id')) return false;
      if (k.endsWith('Nombre') && idKeys.has(`${k.slice(0, -'Nombre'.length)}Id`)) return false;
      return true;
    })
    .map(k => ({ key: k, label: camelToLabel(k) }));
}

function camelToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    return String(obj['displayName'] ?? obj['nombre'] ?? obj['name'] ?? '—');
  }
  return String(val);
}

@Component({
  selector: 'app-catalog-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmTableImports, BrnDialogContent, HlmDialogImports,
    HlmSpinnerImports, HlmIconImports, HlmTooltipImports,
    FkComboboxComponent,
  ],
  providers: [provideIcons({
    lucidePencil, lucideTrash2, lucidePlus, lucideSettings,
    lucideRefreshCw, lucideDownload, lucideUpload, lucideExternalLink,
    lucideLayoutList, lucideSlidersHorizontal, lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideFileText, lucideRuler, lucideCheck, lucideCircleX, lucideUserCheck,
  })],
  template: `
    <!-- ── Metadata loading ──────────────────────────────────────────────────── -->
    @if (metaLoading()) {
      <div class="flex items-center justify-center h-full">
        <hlm-spinner />
      </div>
    } @else {

    <div class="h-full flex flex-col min-h-0 overflow-hidden rounded-lg border-2 border-primary bg-background">

      <!-- ── Cabecera ──────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">

        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            @if (meta()?.icono) {
              <ng-icon hlmIcon size="sm" [name]="meta()!.icono!" />
            }
            {{ meta()?.nombrePlural ?? meta()?.displayName ?? tableName() }}
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
              Nuevo {{ meta()?.nombreSingular ?? 'elemento' }}
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
                (click)="openItemForm(singleSelected()!)">
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

      <!-- ── Buscador ──────────────────────────────────────────────────────── -->
      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            [placeholder]="'Buscar en ' + (meta()?.nombrePlural ?? 'registros').toLowerCase() + '...'"
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

      <!-- ── Filtros avanzados ─────────────────────────────────────────────── -->
      @if (showAdvancedFilters()) {
        <div class="px-3 py-2 shrink-0 border-b border-border bg-muted/30">
          <p class="text-xs text-muted-foreground italic">Sin filtros avanzados para esta rejilla</p>
        </div>
      }

      <!-- ── Tabla ─────────────────────────────────────────────────────────── -->
      <div class="flex-1 overflow-auto min-h-0">

        @if (loading()) {
          <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
        }
        @if (error() && !loading()) {
          <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
          <div class="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <ng-icon hlmIcon size="lg" name="lucideSettings" class="opacity-25" />
            <p class="text-sm">No hay {{ (meta()?.nombrePlural ?? 'registros').toLowerCase() }}</p>
            <button hlmBtn variant="outline" size="sm" (click)="openCreate()">
              <ng-icon hlmIcon name="lucidePlus" class="mr-1.5" />Añadir primer {{ (meta()?.nombreSingular ?? 'elemento').toLowerCase() }}
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
          <table hlmTable class="w-full">
            <thead hlmTHead [ngClass]="headerColor">
              <tr hlmTr>
                <th hlmTh class="w-8 pr-0">
                  <input #selectAllCb type="checkbox" class="accent-primary cursor-pointer"
                    [checked]="allSelected()" (change)="toggleSelectAll()" />
                </th>
                @if (hasActiveField()) {
                  <th hlmTh class="w-8 text-center px-1">Act.</th>
                }
                @for (col of columns(); track col.key) {
                  <th hlmTh class="cursor-pointer select-none"
                      [style.width.px]="col.width"
                      [class.text-center]="col.align === 'center'"
                      [class.text-right]="col.align === 'right'"
                      (click)="toggleSort(col.key, $event)">
                    <div class="flex items-center gap-1"
                         [class.justify-center]="col.align === 'center'"
                         [class.justify-end]="col.align === 'right'">
                      {{ col.label }}
                      @if (sortDir(col.key) === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                      @else if (sortDir(col.key) === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                    </div>
                  </th>
                }
                <th hlmTh class="w-16 text-right">Acc.</th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (row of pageItems(); track row['id']; let odd = $odd) {
                <tr
                  hlmTr
                  class="cursor-pointer"
                  [ngClass]="[
                    selectedIds().has(row['id']) ? rowSelectedClass : (odd ? rowStripeClass : ''),
                    selectedIds().has(row['id']) ? '' : rowHoverClass
                  ]"
                  (click)="toggleSelect(row['id'])"
                >
                  <td hlmTd class="pr-0" (click)="$event.stopPropagation()">
                    <input type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="selectedIds().has(row['id'])"
                      (change)="toggleSelect(row['id'])" />
                  </td>
                  @if (hasActiveField()) {
                    <td hlmTd class="px-1 text-center">
                      @if (row['active']) {
                        <ng-icon hlmIcon size="sm" name="lucideCheck" class="text-green-600" />
                      } @else {
                        <ng-icon hlmIcon size="sm" name="lucideCircleX" class="text-destructive" />
                      }
                    </td>
                  }
                  @for (col of columns(); track col.key) {
                    <td hlmTd
                        [class.text-center]="col.align === 'center'"
                        [class.text-right]="col.align === 'right'">
                      {{ formatCellValue(row[col.key]) }}
                    </td>
                  }
                  <td hlmTd class="text-right" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-end gap-0.5">
                      <button hlmBtn variant="ghost" size="icon" class="size-6" title="Editar" (click)="openEdit(row)">
                        <ng-icon hlmIcon size="sm" name="lucidePencil" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-6" title="Ir al formulario" (click)="openItemForm(row)">
                        <ng-icon hlmIcon size="sm" name="lucideFileText" />
                      </button>
                      <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" title="Eliminar" (click)="openDelete(row)">
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

      <!-- ── Pie (paginación) ──────────────────────────────────────────────── -->
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

    </div><!-- /contenedor principal -->

    }<!-- /end @if metaLoading -->

    <!-- ── Formulario crear / editar ─────────────────────────────────────── -->
    <hlm-dialog [state]="formState()" (stateChanged)="onFormStateChanged($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-lg" [showCloseButton]="false">
          <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            @if (meta()?.icono) {
              <ng-icon hlmIcon size="sm" [name]="meta()!.icono!" />
            }
            <h2 class="text-sm font-semibold">
              {{ editingRow() ? 'Editar ' + (meta()?.nombreSingular ?? 'elemento').toLowerCase() : 'Nuevo ' + (meta()?.nombreSingular ?? 'elemento').toLowerCase() }}
            </h2>
          </div>
          <div class="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            @if (formError()) {
              <div class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{{ formError() }}</div>
            }
            @for (col of formColumns(); track col.key) {
              @if (col.fieldType === 'boolean') {
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [id]="'field-' + col.key"
                    class="size-4 rounded border-input accent-primary cursor-pointer"
                    [checked]="getFormField(col.key) === 'true'"
                    (change)="setFormField(col.key, $any($event.target).checked ? 'true' : 'false')"
                  />
                  <label hlmLabel [for]="'field-' + col.key" class="cursor-pointer">
                    {{ col.label }}@if (col.required) { <span class="text-destructive ml-0.5">*</span> }
                  </label>
                </div>
              } @else {
                <div class="space-y-1.5">
                  <label hlmLabel [for]="'field-' + col.key">
                    {{ col.label }}@if (col.required) { <span class="text-destructive ml-0.5">*</span> }
                  </label>
                  @if (col.endpoint) {
                    <app-fk-combobox
                      [endpoint]="col.endpoint"
                      [value]="getFormField(col.key)"
                      (valueChange)="setFormField(col.key, $event)"
                    />
                  } @else if (col.fieldType === 'textarea' || (!col.fieldType && isTextareaField(col.key))) {
                    <textarea
                      [id]="'field-' + col.key"
                      class="flex min-h-[80px] w-full rounded-md border border-primary bg-action/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      [placeholder]="col.placeholder ?? ''"
                      [value]="getFormField(col.key)"
                      (input)="setFormField(col.key, $any($event.target).value)"
                    ></textarea>
                  } @else {
                    <input
                      hlmInput
                      [id]="'field-' + col.key"
                      class="w-full"
                      [type]="col.fieldType === 'number' ? 'number' : col.fieldType === 'date' ? 'date' : col.fieldType === 'email' ? 'email' : 'text'"
                      [placeholder]="col.placeholder ?? ''"
                      [required]="col.required ?? false"
                      [value]="getFormField(col.key)"
                      (input)="setFormField(col.key, $any($event.target).value)"
                    />
                  }
                </div>
              }
            }
            @if (formColumns().length === 0) {
              <p class="text-sm text-muted-foreground italic">Este catálogo requiere un formulario específico.</p>
            }
          </div>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose [disabled]="saving()">Cancelar</button>
            @if (!editingRow()) {
              <button hlmBtn variant="default" (click)="saveAndNext()" [disabled]="saving() || formColumns().length === 0">
                @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }Alta + Siguiente
              </button>
            }
            <button hlmBtn (click)="save()" [disabled]="saving() || formColumns().length === 0">
              @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              {{ editingRow() ? 'Aceptar' : 'Alta' }}
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
            @if (meta()?.icono) {
              <ng-icon hlmIcon size="sm" [name]="meta()!.icono!" />
            }
            <h2 class="text-sm font-semibold">¿Eliminar {{ (meta()?.nombreSingular ?? 'elemento').toLowerCase() }}?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">Se eliminará <strong>{{ rowDisplayName(rowToDelete()) }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="destructive" (click)="confirmDelete()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class CatalogAdminComponent extends GridBase<Row> implements OnInit {
  private _tableNameSlug = 'generic';
  protected override get gridId(): string { return `catalog-admin-${this._tableNameSlug}`; }
  protected override readonly labelSingular = '';
  protected override readonly labelPlural = '';
  protected override readonly icon = 'lucideSettings';

  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly appTableSvc  = inject(AppTableService);
  private readonly api          = inject(ApiService);
  private readonly destroyRef   = inject(DestroyRef);

  readonly tableName    = signal('');
  readonly meta         = signal<AppTable | null>(null);
  readonly metaLoading  = signal(true);
  readonly tableFields  = signal<TableField[]>([]);

  // Grid columns: prefer t900_table_fields with visibleInGrid=true, else auto-derive
  readonly columns = computed((): ColumnDef[] => {
    const defined = this.tableFields().filter(f => f.visibleInGrid);
    if (defined.length) {
      return [...defined]
        .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
        .map(f => ({ key: f.fieldName, label: f.displayName ?? camelToLabel(f.fieldName), width: f.gridWidth, align: f.gridAlign }));
    }
    const items = this.allItems();
    return items.length ? deriveColumns(items[0]) : [];
  });

  readonly hasActiveField = computed(() => {
    const items = this.allItems();
    return items.length > 0 && 'active' in items[0];
  });

  // Form columns: prefer t900_table_fields with visibleInForm=true,
  // then fall back to formFields string, then auto-derive from grid columns
  readonly formColumns = computed((): FormFieldDef[] => {
    const defined = this.tableFields().filter(f => f.visibleInForm);
    if (defined.length) {
      return [...defined]
        .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
        .map(f => ({
          key:          f.fieldName,
          label:        f.displayName ?? camelToLabel(f.fieldName),
          endpoint:     f.endpoint    ?? undefined,
          fieldType:    f.fieldType,
          required:     f.required,
          defaultValue: f.defaultValue,
          placeholder:  f.placeholder,
        }));
    }
    const formFieldsStr = this.meta()?.formFields;
    if (formFieldsStr) {
      return formFieldsStr.split(',')
        .map(part => {
          const trimmed = part.trim();
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx > 0) {
            return { key: trimmed.slice(0, colonIdx), label: camelToLabel(trimmed.slice(0, colonIdx)), endpoint: trimmed.slice(colonIdx + 1) };
          }
          return { key: trimmed, label: camelToLabel(trimmed) };
        })
        .filter(c => c.key);
    }
    return this.columns().map(c => ({ key: c.key, label: c.label }));
  });

  // ── Form state ─────────────────────────────────────────────────────────────
  readonly editingRow    = signal<Row | null>(null);
  readonly rowToDelete   = signal<Row | null>(null);
  readonly formValues    = signal<Record<string, string>>({});
  readonly formError     = signal<string | null>(null);
  readonly formState     = signal<DialogState>(null);
  readonly deleteState   = signal<DialogState>(null);
  readonly saving        = signal(false);

  private readonly selectAllCbRef = viewChild<ElementRef<HTMLInputElement>>('selectAllCb');

  constructor() {
    super();
    effect(() => {
      const el = this.selectAllCbRef()?.nativeElement;
      if (el) el.indeterminate = this.someSelected();
    });
  }

  override ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const name = params.get('tableName') ?? '';
        this.initForTable(name);
      });
  }

  private initForTable(name: string): void {
    this._tableNameSlug = name;
    this.tableName.set(name);
    this.allItems.set([]);
    this.meta.set(null);
    this.tableFields.set([]);
    this.metaLoading.set(true);
    this.error.set(null);
    this.loadGridPrefs();

    this.appTableSvc.getByTableName(name).subscribe({
      next: meta => {
        this.meta.set(meta);
        this.metaLoading.set(false);
        this.load();
        this.appTableSvc.getFieldsByTableId(meta.id).subscribe({
          next: fields => this.tableFields.set(fields),
          error: () => { /* sin campos definidos: se usará formFields o auto-derivación */ },
        });
      },
      error: () => { this.metaLoading.set(false); this.error.set('No se pudo cargar la configuración de la tabla.'); },
    });
  }

  protected override load(): void {
    const endpoint = this.meta()?.endpointBase;
    if (!endpoint) return;
    this.loading.set(true);
    this.error.set(null);
    this.api.get<Row[]>(this.appTableSvc.resolveEndpointPath(endpoint)).subscribe({
      next: data => { this.allItems.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar los datos.'); this.loading.set(false); },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  formatCellValue(val: unknown): string { return formatValue(val); }

  rowDisplayName(row: Row | null): string {
    if (!row) return '';
    return String(row['nombre'] ?? row['name'] ?? row['descripcion'] ?? row['id'] ?? '');
  }

  isTextareaField(key: string): boolean {
    return ['description', 'descripcion', 'descripcionLarga', 'notas', 'observaciones', 'notes'].includes(key);
  }

  getFormField(key: string): string { return this.formValues()[key] ?? ''; }

  setFormField(key: string, value: string): void {
    this.formValues.update(v => ({ ...v, [key]: value }));
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  openItemForm(row: Row): void {
    const route = this.meta()?.formRoute;
    if (route) {
      this.router.navigate([route, row['id']]);
    } else {
      this.openEdit(row);
    }
  }

  openCreate(): void {
    const route = this.meta()?.formRoute;
    if (route) {
      this.router.navigate([route, 'new']);
      return;
    }
    this.editingRow.set(null);
    const vals: Record<string, string> = {};
    this.formColumns().forEach(c => { vals[c.key] = c.defaultValue ?? ''; });
    this.formValues.set(vals);
    this.formError.set(null);
    this.formState.set('open');
  }

  openEdit(row: Row): void {
    const route = this.meta()?.formRoute;
    if (route) { this.router.navigate([route, row['id']]); return; }
    this.editingRow.set(row);
    const vals: Record<string, string> = {};
    this.formColumns().forEach(c => {
      if (c.endpoint) {
        const val = row[c.key];
        if (val && typeof val === 'object') {
          vals[c.key] = String((val as Record<string, unknown>)['id'] ?? '');
        } else {
          vals[c.key] = String(val ?? '');
        }
      } else {
        vals[c.key] = String(row[c.key] ?? '');
      }
    });
    this.formValues.set(vals);
    this.formError.set(null);
    this.formState.set('open');
  }

  openDelete(row: Row): void { this.rowToDelete.set(row); this.deleteState.set('open'); }

  onFormStateChanged(state: string): void   { if (state === 'closed') this.formState.set(null); }
  onDeleteStateChanged(state: string): void { if (state === 'closed') this.deleteState.set(null); }

  save(): void       { this.doSave(() => this.formState.set('closed')); }
  saveAndNext(): void {
    this.doSave(() => {
      const vals: Record<string, string> = {};
      this.formColumns().forEach(c => { vals[c.key] = ''; });
      this.formValues.set(vals);
      this.formError.set(null);
    });
  }

  private doSave(onSuccess: () => void): void {
    const endpoint = this.meta()?.endpointBase;
    if (!endpoint) return;
    const path = this.appTableSvc.resolveEndpointPath(endpoint);
    const editing = this.editingRow();

    // FK fields send as fieldId (e.g., applicationId) instead of field object
    // Boolean fields are coerced to actual booleans so Jackson can deserialize them
    const body: Record<string, unknown> = {};
    this.formColumns().forEach(col => {
      const val = this.formValues()[col.key] ?? '';
      if (col.endpoint) {
        body[col.key + 'Id'] = val;
      } else if (col.fieldType === 'boolean') {
        body[col.key] = val === 'true';
      } else {
        body[col.key] = val;
      }
    });

    this.saving.set(true);
    this.formError.set(null);

    const req$ = editing
      ? this.api.put<Row>(`${path}/${editing['id']}`, body)
      : this.api.post<Row>(path, body);

    req$.subscribe({
      next: () => { this.saving.set(false); this.load(); onSuccess(); },
      error: () => { this.formError.set('Error al guardar. Inténtalo de nuevo.'); this.saving.set(false); },
    });
  }

  confirmDelete(): void {
    const row = this.rowToDelete();
    const endpoint = this.meta()?.endpointBase;
    if (!row || !endpoint) return;
    const path = this.appTableSvc.resolveEndpointPath(endpoint);
    this.api.delete(`${path}/${row['id']}`).subscribe({
      next: () => { this.deleteState.set('closed'); this.load(); },
      error: () => { this.deleteState.set('closed'); this.error.set('Error al eliminar.'); },
    });
  }
}
