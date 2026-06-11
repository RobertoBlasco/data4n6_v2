import { computed, Directive, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Subject, merge } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { AppTableService } from '../../core/services/app-table.service';
import { AppTable } from '../../core/models/app-table.model';
import { TableField } from '../../core/models/table-field.model';

export interface GridViewDef {
  id: string;
  icon: string;
  label: string;
  description?: string;
}

export const GRID_VIEW = {
  GRID:        { id: 'GRID',        icon: 'lucideTable2',          label: 'Rejilla',           description: 'Lista de registros en tabla' },
  GRID_DETAIL: { id: 'GRID_DETAIL', icon: 'lucidePanelsLeftRight', label: 'Rejilla + detalle', description: 'Tabla con panel de detalle lateral' },
  CARD:        { id: 'CARD',        icon: 'lucideLayoutGrid',      label: 'Tarjetas',          description: 'Vista en tarjetas' },
} satisfies Record<string, GridViewDef>;

export const BTN_NEW_CLS         = 'size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground';
export const BTN_DESTRUCTIVE_CLS = 'h-8 shrink-0 text-red-600 border-red-400 hover:bg-red-50';

export interface SortCriterion {
  field: string;
  dir: 'asc' | 'desc';
}

@Directive()
export abstract class GridBase<T extends { id: string }> {
  protected abstract readonly gridId: string;
  protected abstract readonly labelSingular: string;
  protected abstract readonly labelPlural: string;
  protected abstract readonly icon: string;

  protected readonly colMetaTableName: string | null = null;

  readonly btnNewCls         = BTN_NEW_CLS;
  readonly btnDestructiveCls = BTN_DESTRUCTIVE_CLS;

  protected readonly toolbarColor  = 'bg-[#005a3b] text-white';
  protected readonly headerColor   = 'bg-surface-warm';
  protected readonly footerColor   = 'bg-surface-warm';

  readonly containerCls = 'h-full flex flex-col min-h-0 overflow-hidden border-2 border-primary rounded-lg bg-background';
  readonly toolbarCls   = `flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b-4 border-[#f4c430] ${this.toolbarColor}`;
  readonly footerCls    = `flex items-center justify-between px-4 h-10 shrink-0 border-t border-border text-muted-foreground ${this.footerColor}`;
  protected readonly rowStripeClass   = 'bg-surface-primary';
  protected readonly rowHoverClass    = 'hover:!bg-action/25';
  protected readonly rowSelectedClass = 'bg-action/25';
  protected readonly gridViews: GridViewDef[] = [GRID_VIEW.GRID];
  protected readonly defaultView: GridViewDef = GRID_VIEW.GRID;

  protected readonly http = inject(HttpClient);
  private readonly _colMetaSvc = inject(AppTableService);

  readonly tableMeta     = signal<AppTable | null>(null);
  readonly gridTitle     = computed(() =>
    this.tableMeta()?.nombrePlural ?? this.tableMeta()?.displayName ?? this.labelPlural
  );
  readonly colMetaFields = signal<TableField[]>([]);

  readonly allItems = signal<T[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sortCriteria = signal<SortCriterion[]>([]);
  readonly currentPage = signal(0);
  readonly pageSize = signal(15);
  readonly showAdvancedFilters = signal(false);
  readonly selectedIds = signal(new Set<string>());
  readonly searchInput = signal('');

  readonly pageSizes = [15, 25, 50, 100] as const;

  private readonly searchSubject = new Subject<string>();
  private readonly clearSubject = new Subject<void>();

  readonly searchQuery = toSignal(
    merge(
      this.searchSubject.pipe(debounceTime(300)),
      this.clearSubject.pipe(map(() => ''))
    ),
    { initialValue: '' }
  );

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let items = this.allItems();
    if (q) {
      items = items.filter(item =>
        Object.values(item as Record<string, unknown>).some(
          v => typeof v === 'string' && v.toLowerCase().includes(q)
        )
      );
    }
    const criteria = this.sortCriteria();
    if (criteria.length) {
      items = [...items].sort((a, b) => {
        for (const { field, dir } of criteria) {
          const av = String((a as Record<string, unknown>)[field] ?? '');
          const bv = String((b as Record<string, unknown>)[field] ?? '');
          const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
          if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }
    return items;
  });

  readonly totalRecords = computed(() => this.filteredItems().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRecords() / this.pageSize())));

  readonly pageItems = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages() - 1);
    const start = page * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  readonly displayFrom = computed(() =>
    this.totalRecords() === 0 ? 0 : this.currentPage() * this.pageSize() + 1
  );

  readonly displayTo = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.totalRecords())
  );

  readonly pageNumbers = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const cur = this.currentPage() + 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const nums = new Set<number>(
      [1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total)
    );
    const sorted = [...nums].sort((a, b) => a - b);
    const result: (number | '...')[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) result.push('...');
      result.push(p);
      prev = p;
    }
    return result;
  });

  readonly allSelected = computed(() => {
    const items = this.pageItems();
    const sel = this.selectedIds();
    return items.length > 0 && items.every(i => sel.has(i.id));
  });

  readonly someSelected = computed(() => {
    const items = this.pageItems();
    const sel = this.selectedIds();
    return !this.allSelected() && items.some(i => sel.has(i.id));
  });

  readonly selectionCount  = computed(() => this.selectedIds().size);
  readonly lastSelectedIdx = signal<number>(-1);

  readonly singleSelected = computed((): T | null => {
    if (this.selectedIds().size !== 1) return null;
    const id = [...this.selectedIds()][0];
    return this.allItems().find(i => i.id === id) ?? null;
  });

  readonly activeView = signal<GridViewDef>(GRID_VIEW.GRID);
  readonly showViewPicker = signal(false);

  constructor() {
    effect(() => {
      this.searchQuery();
      this.currentPage.set(0);
    });
  }

  protected abstract load(): void;

  ngOnInit(): void {}

  isColumnVisible(fieldName: string): boolean {
    const fields = this.colMetaFields();
    if (fields.length === 0) return true;
    return fields.find(f => f.fieldName === fieldName)?.visibleInGrid ?? false;
  }

  colLabel(fieldName: string, fallback: string): string {
    return this.colMetaFields().find(f => f.fieldName === fieldName)?.displayName ?? fallback;
  }

  colWidthPx(fieldName: string): number | null {
    return this.colMetaFields().find(f => f.fieldName === fieldName)?.gridWidth ?? null;
  }

  reload(): void { this.load(); }

  onSearchInput(value: string): void {
    this.searchInput.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.clearSubject.next();
  }

  toggleSort(field: string, event: MouseEvent): void {
    const multi = event.shiftKey;
    const current = this.sortCriteria();
    const existing = current.find(c => c.field === field);

    if (!multi) {
      if (!existing) this.sortCriteria.set([{ field, dir: 'asc' }]);
      else if (existing.dir === 'asc') this.sortCriteria.set([{ field, dir: 'desc' }]);
      else this.sortCriteria.set([]);
    } else {
      if (!existing) this.sortCriteria.set([...current, { field, dir: 'asc' }]);
      else if (existing.dir === 'asc') this.sortCriteria.set(current.map(c => c.field === field ? { ...c, dir: 'desc' as const } : c));
      else this.sortCriteria.set(current.filter(c => c.field !== field));
    }
    this.currentPage.set(0);
  }

  sortDir(field: string): 'asc' | 'desc' | null {
    return this.sortCriteria().find(c => c.field === field)?.dir ?? null;
  }

  sortPriority(field: string): number | null {
    const idx = this.sortCriteria().findIndex(c => c.field === field);
    return idx >= 0 && this.sortCriteria().length > 1 ? idx + 1 : null;
  }

  setPage(page: number): void {
    this.currentPage.set(Math.max(0, Math.min(page, this.totalPages() - 1)));
    this.lastSelectedIdx.set(-1);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    localStorage.setItem(`grid:${this.gridId}:pageSize`, String(size));
  }

  toggleSelectAll(): void {
    const next = new Set(this.selectedIds());
    if (this.allSelected()) this.pageItems().forEach(i => next.delete(i.id));
    else this.pageItems().forEach(i => next.add(i.id));
    this.selectedIds.set(next);
  }

  toggleSelect(id: string): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  clearSelection(): void { this.selectedIds.set(new Set()); this.lastSelectedIdx.set(-1); }

  toggleSelectRange(id: string, index: number, event: MouseEvent): void {
    event.stopPropagation();

    if (event.shiftKey && this.lastSelectedIdx() >= 0) {
      event.preventDefault(); // Prevenir el cambio del checkbox cuando se usa Shift
      const items = this.pageItems();
      const last  = this.lastSelectedIdx();
      const [from, to] = last <= index ? [last, index] : [index, last];
      const next = new Set(this.selectedIds());
      for (let i = from; i <= to; i++) next.add(items[i].id);
      this.selectedIds.set(next);
    } else {
      this.toggleSelect(id);
      this.lastSelectedIdx.set(index);
    }
  }

  protected loadGridPrefs(): void {
    const saved = localStorage.getItem(`grid:${this.gridId}:pageSize`);
    if (saved) {
      const n = Number(saved);
      if ([15, 25, 50, 100].includes(n)) this.pageSize.set(n);
    }
    this.activeView.set(this.defaultView);
    if (this.colMetaTableName) {
      this._colMetaSvc.getByTableName(this.colMetaTableName).subscribe({
        next: meta => this.tableMeta.set(meta),
        error: () => {},
      });
      this._colMetaSvc.getFieldsByTableName(this.colMetaTableName)
        .subscribe(fields =>
          this.colMetaFields.set([...fields].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99)))
        );
    }
  }

  resetGridPrefs(): void {
    localStorage.removeItem(`grid:${this.gridId}:pageSize`);
    this.pageSize.set(15);
    this.currentPage.set(0);
  }

  toggleViewPicker(): void { this.showViewPicker.update(v => !v); }
  setView(view: GridViewDef): void { this.activeView.set(view); this.showViewPicker.set(false); }
}
