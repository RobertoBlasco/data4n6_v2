import {
  ChangeDetectionStrategy, Component, OnInit, inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import {
  lucideDatabase,
  lucideRefreshCw, lucideDownload, lucideTrash2,
  lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { AppTable } from '../../core/models/app-table.model';
import { AppTableService } from '../../core/services/app-table.service';
import { GridBase } from '../../shared/grid/grid-base';

@Component({
  selector: 'app-app-tables',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, NgClass,
    HlmButtonImports, HlmTableImports,
    HlmSpinnerImports, HlmIconImports,
  ],
  providers: [provideIcons({
    lucideDatabase,
    lucideRefreshCw, lucideDownload, lucideTrash2,
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
            <ng-icon hlmIcon size="sm" name="lucideDatabase" />{{ gridTitle() }}
          </h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Recargar" (click)="reload()">
              <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
            </button>
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Exportar">
              <ng-icon hlmIcon size="sm" name="lucideDownload" />
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
            <button hlmBtn variant="ghost" size="icon" [class]="btnNewCls" title="Deseleccionar" (click)="clearSelection()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          </div>
        }
      </div>

      <!-- Search bar -->
      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch" class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar tabla..."
            [value]="searchInput()" (input)="onSearchInput($any($event.target).value)" />
          @if (searchInput()) {
            <button class="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground" (click)="clearSearch()">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          }
        </div>
      </div>

      <!-- Content -->
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
        @if (!loading() && !error() && totalRecords() > 0) {
          <table hlmTable class="w-full">
            <thead hlmTHead [ngClass]="headerColor">
              <tr hlmTr>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('tableName', $event)">
                  <div class="flex items-center gap-1">Nombre técnico
                    @if (sortDir('tableName') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('tableName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('displayName', $event)">
                  <div class="flex items-center gap-1">Nombre visible
                    @if (sortDir('displayName') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('displayName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh>Descripción</th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('seccionMenu', $event)">
                  <div class="flex items-center gap-1">Sección
                    @if (sortDir('seccionMenu') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('seccionMenu') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('dbSchema', $event)">
                  <div class="flex items-center gap-1">Esquema
                    @if (sortDir('dbSchema') === 'asc') { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('dbSchema') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (table of pageItems(); track table.id; let odd = $odd) {
                <tr hlmTr [ngClass]="[odd ? rowStripeClass : '', rowHoverClass]">
                  <td hlmTd>
                    <code class="text-xs font-mono text-primary">{{ table.tableName }}</code>
                  </td>
                  <td hlmTd>{{ table.displayName }}</td>
                  <td hlmTd>{{ table.description ?? '—' }}</td>
                  <td hlmTd>
                    @if (table.seccionMenu) {
                      <span class="text-xs border border-border rounded px-1.5 py-0.5 font-mono">{{ table.seccionMenu }}</span>
                    } @else { <span class="text-muted-foreground">—</span> }
                  </td>
                  <td hlmTd>
                    @if (table.dbSchema) {
                      <span class="text-xs font-mono">{{ table.dbSchema }}</span>
                    } @else { <span class="text-muted-foreground">—</span> }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Footer / paginación -->
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
  `,
})
export class AppTablesComponent extends GridBase<AppTable> implements OnInit {
  protected override readonly gridId        = 'admin-app-tables';
  protected override readonly labelSingular = 'Tabla';
  protected override readonly labelPlural   = 'Tablas del sistema';
  protected override readonly icon          = 'lucideDatabase';
  protected override readonly colMetaTableName = 't900_app_tables';

  private readonly appTableSvc = inject(AppTableService);

  override ngOnInit(): void { this.loadGridPrefs(); this.load(); }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.appTableSvc.getAll().subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar las tablas del sistema.'); this.loading.set(false); },
    });
  }
}
