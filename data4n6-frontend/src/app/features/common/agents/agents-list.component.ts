import {
  ChangeDetectionStrategy, Component, ElementRef,
  OnInit, effect, inject, signal, viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import {
  lucideUserCheck, lucidePlus,
  lucideRefreshCw, lucideDownload, lucideTrash2,
  lucideLayoutList, lucideSlidersHorizontal,
  lucideSearch, lucideX,
  lucideChevronLeft, lucideChevronRight,
  lucideChevronsLeft, lucideChevronsRight,
  lucideChevronUp, lucideChevronDown,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { GridBase } from '../../../shared/grid/grid-base';

const API = 'http://localhost:8080/api/v1/catalog/agents';

interface Agent {
  id: string;
  callSign:  string | null;
  firstName: string | null;
  lastName:  string | null;
  unitId:    string | null;
  unitName:  string | null;
  active:    boolean;
}

@Component({
  selector: 'app-agents-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    HlmButtonImports, HlmTableImports,
    HlmSpinnerImports, HlmIconImports,
  ],
  providers: [provideIcons({
    lucideUserCheck, lucidePlus,
    lucideRefreshCw, lucideDownload, lucideTrash2,
    lucideLayoutList, lucideSlidersHorizontal,
    lucideSearch, lucideX,
    lucideChevronLeft, lucideChevronRight,
    lucideChevronsLeft, lucideChevronsRight,
    lucideChevronUp, lucideChevronDown,
    lucideExternalLink,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0 overflow-hidden border-2 border-primary rounded-lg bg-background">

      <!-- Cabecera -->
      <div class="flex items-center justify-between pl-4 pr-2 h-11 shrink-0 border-b border-border" [ngClass]="toolbarColor">
        @if (selectionCount() === 0) {
          <h1 class="text-sm font-semibold flex items-center gap-1.5">
            <ng-icon hlmIcon size="sm" name="lucideUserCheck" />{{ gridTitle() }}
          </h1>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Recargar" (click)="reload()">
              <ng-icon hlmIcon size="sm" name="lucideRefreshCw" />
            </button>
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Exportar">
              <ng-icon hlmIcon size="sm" name="lucideDownload" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Columnas">
              <ng-icon hlmIcon size="sm" name="lucideLayoutList" />
            </button>
            <div class="border-r border-primary-foreground/20 h-4 mx-1"></div>
            <button hlmBtn variant="action" size="sm" class="h-7" (click)="goNew()">
              <ng-icon hlmIcon size="sm" name="lucidePlus" class="mr-1" />Nuevo agente
            </button>
          </div>
        } @else {
          <span class="text-sm">{{ selectionCount() }} seleccionado{{ selectionCount() !== 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-0.5">
            <button hlmBtn variant="ghost" size="sm" class="h-7 text-destructive hover:text-destructive hover:bg-primary-foreground/15">
              <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
            </button>
            @if (selectionCount() === 1) {
              <button hlmBtn variant="ghost" size="sm" class="h-7 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                (click)="goDetail(singleSelected()!)">
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

      <!-- Buscador -->
      <div class="px-3 py-2 shrink-0 border-b border-border">
        <div class="relative">
          <ng-icon hlmIcon size="sm" name="lucideSearch"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            class="w-full h-8 pl-8 pr-8 rounded-md border border-primary bg-action/5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Buscar por distintivo, nombre o unidad..."
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

      <!-- Contenido -->
      <div class="flex-1 overflow-auto min-h-0">
        @if (loading()) {
          <div class="flex items-center justify-center py-12"><hlm-spinner /></div>
        }
        @if (error() && !loading()) {
          <div class="m-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ error() }}</div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && !searchQuery()) {
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <ng-icon hlmIcon size="lg" name="lucideUserCheck" class="opacity-25" />
            <p class="text-sm">No hay agentes registrados</p>
          </div>
        }
        @if (!loading() && !error() && totalRecords() === 0 && searchQuery()) {
          <div class="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
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
                <th hlmTh class="w-28 cursor-pointer select-none" (click)="toggleSort('callSign', $event)">
                  <div class="flex items-center gap-1">Distintivo
                    @if (sortDir('callSign') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('callSign') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('lastName', $event)">
                  <div class="flex items-center gap-1">Nombre
                    @if (sortDir('lastName') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('lastName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="cursor-pointer select-none" (click)="toggleSort('unitName', $event)">
                  <div class="flex items-center gap-1">Unidad
                    @if (sortDir('unitName') === 'asc')  { <ng-icon hlmIcon size="sm" name="lucideChevronUp" /> }
                    @else if (sortDir('unitName') === 'desc') { <ng-icon hlmIcon size="sm" name="lucideChevronDown" /> }
                  </div>
                </th>
                <th hlmTh class="w-20 text-center">Activo</th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (a of pageItems(); track a.id; let odd = $odd) {
                <tr hlmTr class="cursor-pointer"
                  [class.bg-action/25]="selectedIds().has(a.id)"
                  [ngClass]="[odd && !selectedIds().has(a.id) ? rowStripeClass : '', rowHoverClass]"
                  (click)="toggleSelectRange(a.id, $index, $event)"
                  (dblclick)="goDetail(a)">
                  <td hlmTd class="pr-0">
                    <input type="checkbox" class="accent-primary cursor-pointer"
                      [checked]="selectedIds().has(a.id)"
                      (click)="toggleSelectRange(a.id, $index, $event)" />
                  </td>
                  <td hlmTd class="font-mono text-xs">{{ a.callSign ?? '—' }}</td>
                  <td hlmTd class="text-xs">{{ fullName(a) }}</td>
                  <td hlmTd class="text-xs">{{ a.unitName ?? '—' }}</td>
                  <td hlmTd class="text-center text-xs">{{ a.active ? '✓' : '' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Paginación -->
      @if (!loading() && !error() && totalRecords() > 0) {
        <div class="flex items-center justify-between px-4 h-10 shrink-0 border-t border-border text-xs text-muted-foreground" [ngClass]="footerColor">
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
export class AgentsListComponent extends GridBase<Agent> implements OnInit {
  protected override readonly gridId        = 'common-agents';
  protected override readonly labelSingular = 'Agente';
  protected override readonly labelPlural   = 'Agentes';
  protected override readonly icon          = 'lucideUserCheck';
  protected override readonly colMetaTableName = 't100_agents';

  private readonly router         = inject(Router);
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
    this.sortCriteria.set([{ field: 'lastName', dir: 'asc' }]);
    this.load();
  }

  protected override load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Agent[]>(API).subscribe({
      next:  data => { this.allItems.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Error al cargar los agentes'); this.loading.set(false); },
    });
  }

  fullName(a: Agent): string {
    return [a.firstName, a.lastName].filter(Boolean).join(' ') || '—';
  }

  goNew(): void { this.router.navigate(['/common/agents/new']); }

  goDetail(a: Agent): void { this.router.navigate(['/common/agents', a.id]); }
}
