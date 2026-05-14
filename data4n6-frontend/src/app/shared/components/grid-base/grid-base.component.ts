import {
  Component, ContentChild, input, output, TemplateRef, ViewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-grid-base',
  standalone: true,
  imports: [NgTemplateOutlet, TableModule, IconFieldModule, InputIconModule, InputTextModule],
  template: `
    <div class="grid-wrapper">

      @if (header() && globalFilterFields().length > 0) {
        <div class="grid-search">
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="text"
                   (input)="onGlobalFilter($event)"
                   placeholder="Buscar..." class="grid-search-input" />
          </p-iconfield>
        </div>
      }

      <p-table
        #dt
        class="grid-table"
        [value]="data()"
        [loading]="loading()"
        [paginator]="footer() && paginator()"
        [rows]="pageSize()"
        [sortMode]="sortMultiple() ? 'multiple' : 'single'"
        [sortField]="sortField()"
        [sortOrder]="sortOrder()"
        [globalFilterFields]="globalFilterFields()"
        [selectionMode]="selectionMode"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeightValue"
        [resizableColumns]="resizableColumns()"
        [showGridlines]="showGridlines()"
        [stripedRows]="stripedRows()"
        [size]="size()"
        [selection]="selectedRows"
        (selectionChange)="selectedRows = $event"
        (onRowSelect)="rowSelect.emit($event)"
        (onRowUnselect)="rowUnselect.emit($event)">

        @if (header() && headerTpl) {
          <ng-template #header>
            <ng-container [ngTemplateOutlet]="headerTpl" />
          </ng-template>
        }

        @if (bodyTpl) {
          <ng-template #body let-row let-rowIndex="rowIndex">
            <ng-container
              [ngTemplateOutlet]="bodyTpl"
              [ngTemplateOutletContext]="{ $implicit: row, rowIndex: rowIndex }" />
          </ng-template>
        }

        @if (footer() && footerTpl) {
          <ng-template #footer>
            <ng-container [ngTemplateOutlet]="footerTpl" />
          </ng-template>
        }

      </p-table>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }

    .grid-wrapper { display: flex; flex-direction: column; height: 100%; }

    .grid-search {
      flex-shrink: 0;
      padding: 6px 8px;
      border-bottom: 1px solid var(--p-datatable-border-color, #e5e7eb);
      background: var(--p-datatable-header-background, #f9fafb);
    }
    .grid-search-input { width: 100%; }

    /* Cuando scroll="flex", la tabla ocupa el espacio restante del wrapper */
    ::ng-deep .grid-table.p-datatable-flex-scrollable { flex: 1; min-height: 0; }
  `],
})
export class GridBaseComponent {

  @ViewChild('dt') table!: Table;
  @ContentChild('header') headerTpl?: TemplateRef<any>;
  @ContentChild('body')   bodyTpl?:   TemplateRef<any>;
  @ContentChild('footer') footerTpl?: TemplateRef<any>;

  // ── Datos ────────────────────────────────────────────────────────────────────
  data    = input<any[]>([]);
  loading = input(false);

  // ── Visibilidad ──────────────────────────────────────────────────────────────
  header = input(true);
  footer = input(false);

  // ── Paginador (solo si footer=true) ──────────────────────────────────────────
  paginator = input(false);
  pageSize  = input(25);

  // ── Ordenación ───────────────────────────────────────────────────────────────
  sortMultiple = input(false);
  sortField    = input<string | undefined>(undefined);
  sortOrder    = input<1 | -1>(1);

  // ── Búsqueda global (solo si header=true) ────────────────────────────────────
  globalFilterFields = input<string[]>([]);

  // ── Selección ────────────────────────────────────────────────────────────────
  selection = input<'row' | 'checkbox' | null>(null);

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll           = input(false);
  scrollHeight     = input('flex');
  horizontalScroll = input(false);

  // ── Columnas ─────────────────────────────────────────────────────────────────
  resizableColumns = input(false);

  // ── Estilo visual ────────────────────────────────────────────────────────────
  showGridlines = input(false);
  stripedRows   = input(false);
  size          = input<'small' | 'large' | undefined>(undefined);

  // ── Outputs ──────────────────────────────────────────────────────────────────
  rowSelect   = output<any>();
  rowUnselect = output<any>();

  // ── Estado interno ───────────────────────────────────────────────────────────
  selectedRows: any = null;

  get selectionMode(): 'single' | 'multiple' | undefined {
    const s = this.selection();
    if (s === 'row')      return 'single';
    if (s === 'checkbox') return 'multiple';
    return undefined;
  }

  get scrollable(): boolean {
    return this.scroll() || this.horizontalScroll();
  }

  get scrollHeightValue(): string | undefined {
    return this.scroll() ? this.scrollHeight() : undefined;
  }

  onGlobalFilter(event: Event): void {
    this.table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
