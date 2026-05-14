import {
  Component, ContentChild, input, output, TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { GridBaseComponent } from '../grid-base/grid-base.component';

@Component({
  selector: 'app-grid-expandable',
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
        (onRowUnselect)="rowUnselect.emit($event)"
        [dataKey]="dataKey()"
        [(expandedRowKeys)]="expandedRows"
        (onRowExpand)="rowExpand.emit($event)"
        (onRowCollapse)="rowCollapse.emit($event)">

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

        @if (rowExpansion() && expandedRowTpl) {
          <ng-template #expandedrow let-row>
            <ng-container
              [ngTemplateOutlet]="expandedRowTpl"
              [ngTemplateOutletContext]="{ $implicit: row }" />
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

    ::ng-deep .grid-table.p-datatable-flex-scrollable { flex: 1; min-height: 0; }
  `],
})
export class GridExpandableComponent extends GridBaseComponent {

  @ContentChild('expandedRow') expandedRowTpl?: TemplateRef<any>;

  // ── Expansión ─────────────────────────────────────────────────────────────────
  rowExpansion = input(false);
  dataKey      = input<string>('id');

  // ── Outputs adicionales ───────────────────────────────────────────────────────
  rowExpand   = output<any>();
  rowCollapse = output<any>();

  // ── Estado interno ────────────────────────────────────────────────────────────
  expandedRows: { [key: string]: boolean } = {};
}
