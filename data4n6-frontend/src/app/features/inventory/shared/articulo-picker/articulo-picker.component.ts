import {
  ChangeDetectionStrategy, Component,
  computed, input, model, signal,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideX, lucideSearch, lucidePackagePlus, lucideArrowLeftRight,
  lucideChevronRight, lucideChevronUp, lucideChevronDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';

export interface ArticuloMin {
  id: string;
  serialNumber:        string | null;
  tipoMaterialNombre:  string | null;
  brandName:           string | null;
  modeloDescripcion:   string | null;
  almacenNombre:       string | null;
  estadoActual:        string | null;
  descripcionEstado:   string | null;
  numPrestamos:        number | null;
  fechaUltimoPrestamo: string | null;
}

type SortField = 'serialNumber' | 'tipoMaterialNombre' | 'brandName' | 'modeloDescripcion' | 'descripcionEstado';

@Component({
  selector: 'app-articulo-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmButtonImports, HlmIconImports, HlmInputImports],
  providers: [provideIcons({ lucideX, lucideSearch, lucidePackagePlus, lucideArrowLeftRight, lucideChevronRight, lucideChevronUp, lucideChevronDown })],
  styles: [':host { display: block; height: 100%; }'],
  template: `
    <div [class]="showSelected() ? 'flex gap-4' : 'h-full flex flex-col'">

      <!-- Disponibles -->
      <div class="border-2 border-border rounded-md flex flex-col min-h-0 flex-1">
        <div class="overflow-auto flex-1">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
              <tr>
                <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                  (click)="toggleSort('tipoMaterialNombre', $event)">
                  <span class="flex items-center gap-1">Tipo
                    @if (getSortDir('tipoMaterialNombre'); as dir) {
                      @if (getSortPriority('tipoMaterialNombre'); as p) {
                        <span class="inline-flex items-center justify-center rounded-full bg-white/25 text-[9px] leading-none size-3.5">{{ p }}</span>
                      }
                      <ng-icon hlmIcon size="sm" [name]="dir === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown'" />
                    }
                  </span>
                </th>
                <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                  (click)="toggleSort('brandName', $event)">
                  <span class="flex items-center gap-1">Marca
                    @if (getSortDir('brandName'); as dir) {
                      @if (getSortPriority('brandName'); as p) {
                        <span class="inline-flex items-center justify-center rounded-full bg-white/25 text-[9px] leading-none size-3.5">{{ p }}</span>
                      }
                      <ng-icon hlmIcon size="sm" [name]="dir === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown'" />
                    }
                  </span>
                </th>
                <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                  (click)="toggleSort('modeloDescripcion', $event)">
                  <span class="flex items-center gap-1">Modelo
                    @if (getSortDir('modeloDescripcion'); as dir) {
                      @if (getSortPriority('modeloDescripcion'); as p) {
                        <span class="inline-flex items-center justify-center rounded-full bg-white/25 text-[9px] leading-none size-3.5">{{ p }}</span>
                      }
                      <ng-icon hlmIcon size="sm" [name]="dir === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown'" />
                    }
                  </span>
                </th>
                <th class="text-center font-normal px-3 py-1.5 cursor-pointer select-none whitespace-nowrap w-28"
                  (click)="toggleSort('serialNumber', $event)">
                  <span class="flex items-center justify-center gap-1">N.º Serie
                    @if (getSortDir('serialNumber'); as dir) {
                      @if (getSortPriority('serialNumber'); as p) {
                        <span class="inline-flex items-center justify-center rounded-full bg-white/25 text-[9px] leading-none size-3.5">{{ p }}</span>
                      }
                      <ng-icon hlmIcon size="sm" [name]="dir === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown'" />
                    }
                  </span>
                </th>
                <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                  (click)="toggleSort('descripcionEstado', $event)">
                  <span class="flex items-center gap-1">Descripción estado
                    @if (getSortDir('descripcionEstado'); as dir) {
                      @if (getSortPriority('descripcionEstado'); as p) {
                        <span class="inline-flex items-center justify-center rounded-full bg-white/25 text-[9px] leading-none size-3.5">{{ p }}</span>
                      }
                      <ng-icon hlmIcon size="sm" [name]="dir === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown'" />
                    }
                  </span>
                </th>
                <th class="text-center font-normal px-3 py-1.5 whitespace-nowrap w-20">Nº Préstamos</th>
                <th class="text-center font-normal px-3 py-1.5 whitespace-nowrap w-28">Últ. Préstamo</th>
                <th class="w-6 px-2 text-right font-normal pr-3 opacity-70">{{ articulosOrdenados().length }}</th>
              </tr>
            </thead>
            <tbody>
              @if (articulosOrdenados().length === 0) {
                <tr>
                  <td colspan="8" class="px-3 py-4 text-[#005a3b] text-center italic">Sin artículos disponibles</td>
                </tr>
              } @else {
                @for (a of articulosOrdenados(); track a.id; let odd = $odd) {
                  <tr class="cursor-pointer hover:!bg-action/25 transition-colors border-b border-border/40 last:border-0 group"
                    [class.bg-surface-primary]="odd"
                    (click)="add(a)">
                    <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.tipoMaterialNombre ?? '—' }}</td>
                    <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.brandName ?? '—' }}</td>
                    <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.modeloDescripcion ?? '—' }}</td>
                    <td class="px-3 py-1.5 font-mono text-[#005a3b] text-center truncate max-w-[7rem]">{{ a.serialNumber ?? '—' }}</td>
                    <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.descripcionEstado ?? '—' }}</td>
                    <td class="px-3 py-1.5 text-center tabular-nums text-[#005a3b]">{{ a.numPrestamos ?? 0 }}</td>
                    <td class="px-3 py-1.5 text-center text-[#005a3b] whitespace-nowrap">{{ formatDate(a.fechaUltimoPrestamo) }}</td>
                    <td class="px-2 py-1.5">
                      <ng-icon hlmIcon size="sm" name="lucideChevronRight"
                        class="text-[#005a3b] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Barra inferior: buscador + botón selección rápida -->
        <div class="p-2 border-t border-border shrink-0 flex items-center gap-2">
          <div class="relative flex-1">
            <ng-icon hlmIcon size="sm" name="lucideSearch"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input hlmInput class="w-full pl-8 h-8 text-xs" placeholder="Buscar..."
              #searchRef
              (input)="search.set(searchRef.value)" />
          </div>
          <button hlmBtn variant="outline" size="sm" class="h-8 shrink-0 text-[#005a3b] border-[#005a3b] hover:bg-[#005a3b]/10"
            title="Selección rápida por tipo"
            (click)="openQuickSelect()">
            <ng-icon hlmIcon size="sm" name="lucidePackagePlus" class="mr-1" />
            Selección rápida
          </button>
        </div>
      </div>

      <!-- Seleccionados (solo si showSelected) -->
      @if (showSelected()) {
      <div class="border-2 border-primary rounded-md flex flex-col min-h-0">
        <div class="px-3 py-2 border-b border-border bg-muted/30 shrink-0">
          <span class="text-xs font-medium text-[#005a3b]">Seleccionados ({{ value().length }})</span>
        </div>
        <div class="overflow-auto flex-1" style="max-height: 360px">
          @if (value().length === 0) {
            <p class="px-3 py-6 text-xs text-[#005a3b] text-center italic">
              Haz clic en un artículo de la izquierda para añadirlo
            </p>
          } @else {
            @for (a of value(); track a.id; let odd = $odd) {
              <div class="border-b border-border/40 last:border-0">
                <!-- Fila del artículo -->
                <div class="flex items-center gap-2 px-3 py-1.5"
                  [class.bg-surface-primary]="odd && swapCandidateId() !== a.id"
                  [class.bg-action/10]="swapCandidateId() === a.id">
                  <span class="font-mono text-xs text-[#005a3b] w-28 shrink-0 truncate">{{ a.serialNumber ?? '—' }}</span>
                  <span class="text-xs text-[#005a3b] flex-1 truncate">
                    {{ [a.tipoMaterialNombre, a.brandName, a.modeloDescripcion].filter(x => !!x).join(' · ') || '—' }}
                  </span>
                  <button hlmBtn variant="ghost" size="icon"
                    class="size-6 shrink-0 transition-colors"
                    [class.text-[#005a3b]]="swapCandidateId() === a.id"
                    [class.text-muted-foreground]="swapCandidateId() !== a.id"
                    [class.hover:text-[#005a3b]]="swapCandidateId() !== a.id"
                    title="Cambiar número de serie"
                    (click)="toggleSwap(a.id)">
                    <ng-icon hlmIcon size="sm" name="lucideArrowLeftRight" />
                  </button>
                  <button hlmBtn variant="ghost" size="icon" class="size-6 shrink-0 text-muted-foreground hover:text-destructive"
                    (click)="remove(a.id)">
                    <ng-icon hlmIcon size="sm" name="lucideX" />
                  </button>
                </div>
                <!-- Panel de alternativas -->
                @if (swapCandidateId() === a.id) {
                  <div class="bg-action/5 border-t border-border/40 px-3 py-1.5">
                    @if (swapCandidates().length === 0) {
                      <p class="text-xs text-muted-foreground italic py-1">No hay otros números de serie disponibles para este tipo/marca/modelo.</p>
                    } @else {
                      <p class="text-xs text-muted-foreground mb-1">Selecciona el nuevo N.º de serie:</p>
                      <div class="flex flex-col gap-0.5 max-h-32 overflow-auto">
                        @for (alt of swapCandidates(); track alt.id) {
                          <button class="text-left text-xs px-2 py-1 rounded hover:bg-[#005a3b] hover:text-white text-[#005a3b] font-mono transition-colors"
                            (click)="swapArticulo(a.id, alt)">
                            {{ alt.serialNumber ?? '(sin serie)' }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
      }

    </div>

    <!-- ── Diálogo selección rápida ───────────────────────────────────────────── -->
    @if (showQuickSelect()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (mousedown.self)="showQuickSelect.set(false)">
        <div class="bg-background rounded-lg shadow-xl w-[26rem] p-6 space-y-4">

          <div class="flex items-center gap-2">
            <ng-icon hlmIcon name="lucidePackagePlus" size="sm" class="text-[#005a3b]" />
            <h3 class="text-sm font-medium text-[#005a3b] uppercase tracking-wide">Selección rápida</h3>
          </div>

          <p class="text-xs text-muted-foreground">
            Indica cuántos artículos de cada tipo quieres añadir. Se seleccionarán automáticamente los primeros disponibles.
          </p>

          <!-- Tabla de tipos -->
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-[#005a3b] text-white">
                <tr>
                  <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                  <th class="text-right font-normal px-3 py-1.5 w-20">Disponibles</th>
                  <th class="text-center font-normal px-3 py-1.5 w-20">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                @if (quickSelectTypes().length === 0) {
                  <tr>
                    <td colspan="3" class="px-3 py-4 text-center text-muted-foreground italic">Sin artículos disponibles</td>
                  </tr>
                }
                @for (item of quickSelectTypes(); track item.tipo; let odd = $odd) {
                  <tr class="border-t border-border/40" [class.bg-surface-primary]="odd">
                    <td class="px-3 py-2 text-[#005a3b] truncate">{{ item.tipo }}</td>
                    <td class="px-3 py-2 text-right tabular-nums text-muted-foreground">{{ item.disponibles }}</td>
                    <td class="px-3 py-1.5 text-center">
                      <input type="number" min="0" [max]="item.disponibles"
                        class="w-14 h-7 text-xs text-center rounded border border-border bg-action/5 text-[#005a3b] focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                        style="background-color: #f0f0f0"
                        [value]="quickSelectQty().get(item.tipo) ?? 0"
                        (input)="setQty(item.tipo, +$any($event.target).value)" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Total seleccionado -->
          @if (quickSelectTotal() > 0) {
            <p class="text-xs text-[#005a3b] font-medium">
              Se añadirán {{ quickSelectTotal() }} artículo{{ quickSelectTotal() !== 1 ? 's' : '' }} a la selección.
            </p>
          }

          <div class="flex justify-end gap-2 pt-1">
            <button hlmBtn variant="destructive" size="sm" (click)="showQuickSelect.set(false)">
              Cancelar
            </button>
            <button hlmBtn size="sm" [disabled]="quickSelectTotal() === 0" (click)="applyQuickSelect()">
              Añadir {{ quickSelectTotal() > 0 ? '(' + quickSelectTotal() + ')' : '' }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class ArticuloPickerComponent {
  readonly articulosDisponibles = input<ArticuloMin[]>([]);
  readonly estadoFilter         = input<string>('Almacén');
  readonly showSelected         = input<boolean>(true);
  readonly value                = model<ArticuloMin[]>([]);

  readonly search       = signal('');
  readonly sortCriteria = signal<{ field: SortField; dir: 'asc' | 'desc' }[]>([
    { field: 'tipoMaterialNombre', dir: 'asc' },
    { field: 'brandName',          dir: 'asc' },
    { field: 'modeloDescripcion',  dir: 'asc' },
    { field: 'serialNumber',       dir: 'asc' },
  ]);

  // ── Cambio de número de serie ────────────────────────────────────────────
  readonly swapCandidateId = signal<string | null>(null);

  readonly swapCandidates = computed(() => {
    const id = this.swapCandidateId();
    if (!id) return [];
    const current = this.value().find(a => a.id === id);
    if (!current) return [];
    const selectedIds = new Set(this.value().map(a => a.id));
    return this.articulosDisponibles()
      .filter(a =>
        !selectedIds.has(a.id) &&
        a.tipoMaterialNombre === current.tipoMaterialNombre &&
        a.brandName          === current.brandName &&
        a.modeloDescripcion  === current.modeloDescripcion
      )
      .sort((a, b) => (a.serialNumber ?? '').localeCompare(b.serialNumber ?? '', undefined, { sensitivity: 'base' }));
  });

  toggleSwap(id: string): void {
    this.swapCandidateId.set(this.swapCandidateId() === id ? null : id);
  }

  swapArticulo(currentId: string, newArticulo: ArticuloMin): void {
    this.value.update(list => list.map(a => a.id === currentId ? newArticulo : a));
    this.swapCandidateId.set(null);
  }

  // ── Selección rápida ──────────────────────────────────────────────────────
  readonly showQuickSelect  = signal(false);
  readonly quickSelectQty   = signal<Map<string, number>>(new Map());

  readonly quickSelectTypes = computed(() => {
    const map = new Map<string, number>();
    for (const a of this.articulosFiltrados()) {
      const tipo = a.tipoMaterialNombre ?? '(Sin tipo)';
      map.set(tipo, (map.get(tipo) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([tipo, disponibles]) => ({ tipo, disponibles }))
      .sort((a, b) => a.tipo.localeCompare(b.tipo, undefined, { sensitivity: 'base' }));
  });

  readonly quickSelectTotal = computed(() => {
    let total = 0;
    for (const n of this.quickSelectQty().values()) total += n;
    return total;
  });

  openQuickSelect(): void {
    const m = new Map<string, number>();
    for (const { tipo } of this.quickSelectTypes()) m.set(tipo, 0);
    this.quickSelectQty.set(m);
    this.showQuickSelect.set(true);
  }

  setQty(tipo: string, qty: number): void {
    const max  = this.quickSelectTypes().find(t => t.tipo === tipo)?.disponibles ?? 0;
    const next = new Map(this.quickSelectQty());
    next.set(tipo, Math.min(Math.max(0, isNaN(qty) ? 0 : qty), max));
    this.quickSelectQty.set(next);
  }

  applyQuickSelect(): void {
    const qty  = this.quickSelectQty();
    const pool = this.articulosOrdenados();
    const toAdd: ArticuloMin[] = [];
    for (const [tipo, n] of qty.entries()) {
      if (n <= 0) continue;
      const candidates = pool.filter(a => (a.tipoMaterialNombre ?? '(Sin tipo)') === tipo);
      toAdd.push(...candidates.slice(0, n));
    }
    this.value.update(list => {
      const existing = new Set(list.map(a => a.id));
      return [...list, ...toAdd.filter(a => !existing.has(a.id))];
    });
    this.showQuickSelect.set(false);
  }

  // ── Filtrado y ordenación ─────────────────────────────────────────────────
  readonly articulosFiltrados = computed(() => {
    const q      = this.search().toLowerCase();
    const estado = this.estadoFilter();
    const sel    = new Set(this.value().map(a => a.id));
    return this.articulosDisponibles()
      .filter(a => (!estado || a.estadoActual === estado) && !sel.has(a.id))
      .filter(a => !q ||
        (a.serialNumber        ?? '').toLowerCase().includes(q) ||
        (a.tipoMaterialNombre  ?? '').toLowerCase().includes(q) ||
        (a.brandName           ?? '').toLowerCase().includes(q) ||
        (a.modeloDescripcion   ?? '').toLowerCase().includes(q)
      );
  });

  readonly articulosOrdenados = computed(() => {
    const items    = this.articulosFiltrados();
    const criteria = this.sortCriteria();
    if (!criteria.length) return items;
    return [...items].sort((a, b) => {
      for (const { field, dir } of criteria) {
        const va  = (a[field] ?? '').toLowerCase();
        const vb  = (b[field] ?? '').toLowerCase();
        const cmp = va.localeCompare(vb);
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  });

  toggleSort(field: SortField, event: MouseEvent): void {
    const multi    = event.shiftKey;
    const current  = this.sortCriteria();
    const existing = current.find(c => c.field === field);
    if (!multi) {
      if (!existing)                   this.sortCriteria.set([{ field, dir: 'asc' }]);
      else if (existing.dir === 'asc') this.sortCriteria.set([{ field, dir: 'desc' }]);
      else                             this.sortCriteria.set([]);
    } else {
      if (!existing)                   this.sortCriteria.set([...current, { field, dir: 'asc' }]);
      else if (existing.dir === 'asc') this.sortCriteria.set(current.map(c => c.field === field ? { ...c, dir: 'desc' as const } : c));
      else                             this.sortCriteria.set(current.filter(c => c.field !== field));
    }
  }

  getSortDir(field: SortField): 'asc' | 'desc' | null {
    return this.sortCriteria().find(c => c.field === field)?.dir ?? null;
  }

  getSortPriority(field: SortField): number | null {
    const idx = this.sortCriteria().findIndex(c => c.field === field);
    return idx >= 0 && this.sortCriteria().length > 1 ? idx + 1 : null;
  }

  add(a: ArticuloMin): void {
    this.value.update(list => [...list, a]);
  }

  remove(id: string): void {
    this.value.update(list => list.filter(a => a.id !== id));
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const [y, m, d] = iso.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
}
