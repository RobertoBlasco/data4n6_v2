import {
  ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation,
  computed, ElementRef, inject, input, signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

export interface SortCriterion { field: string; dir: 'asc' | 'desc'; }

const HOVER_BG    = 'oklch(0.796 0.18 83 / 0.25)';
const SELECTED_BG = 'oklch(0.796 0.18 83 / 0.45)';

@Component({
  selector: 'app-historical-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [HlmButtonImports, HlmIconImports, HlmSpinnerImports],
  providers: [provideIcons({ lucideX })],
  styles: [`
    app-historical-grid { display: flex; flex-direction: column; min-height: 0; flex: 1; }
    app-historical-grid tbody td { color: var(--grid-foreground); }
    app-historical-grid tbody tr[data-id] { cursor: pointer; }
  `],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-8"><hlm-spinner /></div>
    } @else {
      <div class="flex-1 min-h-0 overflow-auto border-2 border-primary rounded-md"
           (click)="onTableClick($event)"
           (mouseover)="onRowMouseover($event)"
           (mouseout)="onRowMouseout($event)">
        <table class="w-full text-sm border-collapse">
          <ng-content select="thead" />
          <ng-content select="tbody" />
          @if (emptyState()) {
            <tbody>
              <tr>
                <td colspan="100"
                    class="px-4 py-8 text-center text-xs text-muted-foreground italic">
                  {{ emptyMessage() }}
                </td>
              </tr>
            </tbody>
          }
        </table>
      </div>

      @if (selectable() && selectedId()) {
        <div class="shrink-0 h-9 flex items-center justify-between px-3 mt-1 rounded-md text-xs"
             style="background-color:#005a3b; color:white">
          <span>1 seleccionado</span>
          <div class="flex items-center gap-1">
            <ng-content select="[footer-actions]" />
            <button hlmBtn variant="ghost" size="icon"
              class="size-7 hover:bg-white/15 hover:text-white text-white"
              (click)="clearSelection()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          </div>
        </div>
      }
    }
  `,
})
export class HistoricalGridComponent implements OnInit {
  private readonly el = inject(ElementRef);

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly loading      = input<boolean>(false);
  readonly emptyMessage = input<string>('Sin registros');
  readonly selectable   = input<boolean>(false);

  /** Datos para ordenación interna. Si no se pasa, el padre controla los datos vía tbody. */
  readonly data = input<Record<string, unknown>[]>([]);

  /** Ordenación inicial aplicada al montar el componente. */
  readonly defaultSort = input<SortCriterion[]>([]);

  /**
   * Override del estado vacío. Si no se pasa, se calcula desde data().length.
   * Usar cuando el padre controla los datos directamente (sin input data).
   */
  readonly empty = input<boolean | null>(null);

  readonly emptyState = computed(() => this.empty() ?? this.data().length === 0);

  ngOnInit(): void {
    if (this.defaultSort().length > 0) {
      this.sortCriteria.set(this.defaultSort());
    }
  }

  // ── Ordenación multi-columna ──────────────────────────────────────────────
  readonly sortCriteria = signal<SortCriterion[]>([]);

  readonly sortedData = computed(() => {
    const criteria = this.sortCriteria();
    const items    = [...this.data()];
    if (!criteria.length) return items;
    return items.sort((a, b) => {
      for (const { field, dir } of criteria) {
        const av  = String(a[field] ?? '');
        const bv  = String(b[field] ?? '');
        const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  toggleSort(field: string, event?: MouseEvent): void {
    const multi = event?.shiftKey ?? false;
    this.sortCriteria.update(criteria => {
      const existing = criteria.find(c => c.field === field);
      if (existing) {
        if (existing.dir === 'asc') {
          return criteria.map(c => c.field === field ? { ...c, dir: 'desc' as const } : c);
        } else {
          return criteria.filter(c => c.field !== field);
        }
      }
      return multi ? [...criteria, { field, dir: 'asc' }] : [{ field, dir: 'asc' }];
    });
  }

  getSortDir(field: string): 'asc' | 'desc' | null {
    return this.sortCriteria().find(c => c.field === field)?.dir ?? null;
  }

  getSortPriority(field: string): number | null {
    const idx = this.sortCriteria().findIndex(c => c.field === field);
    return idx >= 0 && this.sortCriteria().length > 1 ? idx + 1 : null;
  }

  // ── Selección de fila (single) ────────────────────────────────────────────
  readonly selectedId    = signal<string | null>(null);
  readonly isAnySelected = computed(() => this.selectedId() !== null);

  isSelected(id: unknown): boolean { return this.selectedId() === String(id); }
  clearSelection(): void { this.setSelectedRow(null); }

  onTableClick(event: MouseEvent): void {
    if (!this.selectable()) return;
    const tr = this.getDataRow(event);
    if (!tr) return;
    const id = tr.getAttribute('data-id')!;
    this.setSelectedRow(id === this.selectedId() ? null : id);
  }

  onRowMouseover(event: MouseEvent): void {
    if (!this.selectable()) return;
    const tr = this.getDataRow(event);
    if (tr && tr.getAttribute('data-id') !== this.selectedId())
      (tr as HTMLElement).style.backgroundColor = HOVER_BG;
  }

  onRowMouseout(event: MouseEvent): void {
    if (!this.selectable()) return;
    const tr = this.getDataRow(event);
    if (tr && tr.getAttribute('data-id') !== this.selectedId())
      (tr as HTMLElement).style.backgroundColor = '';
  }

  private setSelectedRow(id: string | null): void {
    const prev = this.selectedId();
    this.selectedId.set(id);
    this.el.nativeElement.querySelectorAll('tbody tr[data-id]').forEach((tr: HTMLElement) => {
      const rowId = tr.getAttribute('data-id');
      if (rowId === id)   tr.style.backgroundColor = SELECTED_BG;
      else if (rowId === prev) tr.style.backgroundColor = '';
    });
  }

  private getDataRow(event: MouseEvent): Element | null {
    const tr = (event.target as HTMLElement).closest('tr');
    if (!tr || tr.closest('thead')) return null;
    return tr.hasAttribute('data-id') ? tr : null;
  }
}
