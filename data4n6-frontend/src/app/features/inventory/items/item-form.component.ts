import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePackage, lucideHistory, lucideBarChart2,
  lucideLayoutList, lucideChevronRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FormReadonlyDirective } from '../../../shared/form/form-readonly.directive';
import { FormBase } from '../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../shared/form/spa-form-header.component';
import { PicturePanelComponent, PictureItem } from '../../../shared/components/picture-panel/picture-panel.component';
import { HistoricalGridComponent } from '../../../shared/components/historical-grid/historical-grid.component';
import { SectionHeaderComponent } from '../../../shared/components/historical-grid/section-header.component';
import { DetailTreeComponent, DetailTreeNode } from '../../../shared/components/detail-tree/detail-tree.component';
import { StandarTabPanelComponent } from '../../../shared/components/standar-tab-panel/standar-tab-panel.component';
import { AppTableService } from '../../../core/services/app-table.service';
import { ApiService } from '../../../core/services/api.service';

interface Movimiento {
  id: string;
  fecha: string | null;
  tipoEvento: string | null;
  estadoResultante: string | null;
  descripcion: string | null;
  ordenReferencia: string | null;
  estadoOrden: string | null;
  detalle: string | null;
  ordenId: string | null;
  ordenCategoria: string | null;
  ordenPrestamoId: string | null;
}

interface Articulo {
  id: string;
  tipoMaterialId:     string | null;
  tipoMaterialNombre: string | null;
  brandId:            string | null;
  brandName:          string | null;
  almacenId:          string | null;
  almacenNombre:      string | null;
  modeloId:           string | null;
  modeloDescripcion:  string | null;
  serialNumber:       string | null;
  estadoActual:       string | null;
}

interface FotoResponse {
  id:               string;
  pictureTypeId:    string | null;
  pictureTypeName:  string | null;
  esPrincipal:      boolean;
  originalFilename: string;
  filePath:         string;
  caption:          string | null;
  fileSizeBytes:    number | null;
  createdAt:        string;
}

const API = 'http://localhost:8080/api/v1/inventory/articulos';

@Component({
  selector: 'app-item-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports, HlmLabelImports, HlmInputImports,
    HlmSpinnerImports, HlmIconImports,
    SpaFormHeaderComponent, FormReadonlyDirective,
    PicturePanelComponent,
    HistoricalGridComponent,
    SectionHeaderComponent,
    DetailTreeComponent,
    StandarTabPanelComponent,
  ],
  providers: [provideIcons({
    lucidePackage, lucideHistory, lucideBarChart2,
    lucideLayoutList, lucideChevronRight,
  })],
  template: `
    <div class="h-full flex flex-col min-h-0" [appFormReadonly]="formReadonly()">

      <app-spa-form-header
        [icon]="formIcon()"
        [readonly]="isView() ? true : null"
        [label]="isView() ? 'Artículo' : 'Nuevo artículo'"
        [description]="articuloDescription()"
        [backRoute]="resolvedBackRoute()">
      </app-spa-form-header>

      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">

        @if (loading()) {
          <div class="flex items-center justify-center py-20"><hlm-spinner /></div>
        }

        @if (loadError() && !loading()) {
          <div class="m-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ loadError() }}</div>
        }

        @if (!loading() && !loadError()) {
          <div class="flex-1 min-h-0 flex gap-6 p-6">

            <!-- ── IZQUIERDA: fotos + datos generales + árbol ──────────────── -->
            <div class="flex flex-col gap-4 shrink-0 w-fit min-h-0">

              <div class="flex gap-6 items-stretch shrink-0">

                <!-- Panel de fotos -->
                <div class="w-64 flex flex-col">
                  <app-picture-panel class="flex-1"
                    title="Fotos" icon="lucideImage"
                    [appTableId]="articuoAppTableId() ?? ''"
                    [recordId]="articuloId() ?? ''"
                    pictureTypeId=""
                    [pictures]="fotos()" [loading]="loadingFotos()"
                    (delete)="onDeleteFoto($event)"
                    (setPrincipal)="onSetPrincipal($event)"
                    (pictureAdded)="onPictureAdded($event)" />
                </div>

                <!-- Datos generales -->
                <div class="w-80 space-y-3">
                  <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide">Datos generales</p>
                  <div class="space-y-1">
                    <label hlmLabel class="text-xs">Tipo de material</label>
                    <input hlmInput readonly class="w-full h-8 text-xs" style="background-color:#f0f0f0" [value]="tipoMaterialNombre() || '—'" />
                  </div>
                  <div class="space-y-1">
                    <label hlmLabel class="text-xs">Marca</label>
                    <input hlmInput readonly class="w-full h-8 text-xs" style="background-color:#f0f0f0" [value]="brandName() || '—'" />
                  </div>
                  <div class="space-y-1">
                    <label hlmLabel class="text-xs">Modelo</label>
                    <input hlmInput readonly class="w-full h-8 text-xs" style="background-color:#f0f0f0" [value]="modeloDescripcion() || '—'" />
                  </div>
                  <div class="space-y-1">
                    <label hlmLabel class="text-xs">N.º de serie</label>
                    <input hlmInput readonly class="w-full h-8 text-xs" style="background-color:#f0f0f0" [value]="serialNumber() || '—'" />
                  </div>
                  <div class="space-y-1">
                    <label hlmLabel class="text-xs">Estado actual</label>
                    <input hlmInput readonly class="w-full h-8 text-xs" style="background-color:#f0f0f0" [value]="estadoActual() || '—'" />
                  </div>
                </div>

              </div>

              <!-- Árbol de navegación -->
              <app-detail-tree
                [nodes]="treeNodes"
                [activeId]="activeNode()"
                (activeIdChange)="activeNode.set($event)" />

            </div>

            <!-- ── CONTENIDO del nodo activo ───────────────────────────────── -->
            <div class="flex-1 min-h-0 flex overflow-hidden">
              <div class="flex-1 min-h-0 flex flex-col">

                <!-- Historial de movimientos -->
                <div [style.display]="activeNode() === 'historial' ? 'flex' : 'none'"
                     class="flex-1 min-h-0 flex-col gap-2">
                  <app-section-header title="Historial de movimientos" icon="lucideHistory" />
                  <app-historical-grid #histGrid
                    [loading]="loadingHistorial()"
                    [data]="$any(historial())"
                    [selectable]="true"
                    [defaultSort]="[{field: 'fecha', dir: 'desc'}]"
                    emptyMessage="Sin movimientos registrados">
                    <thead class="bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1.5 w-36 whitespace-nowrap cursor-pointer select-none"
                            (click)="histGrid.toggleSort('fecha', $event)">
                          Fecha {{ histGrid.getSortDir('fecha') === 'asc' ? '↑' : histGrid.getSortDir('fecha') === 'desc' ? '↓' : '' }}
                          @if (histGrid.getSortPriority('fecha')) {<sup class="text-[9px]">{{ histGrid.getSortPriority('fecha') }}</sup>}
                        </th>
                        <th class="text-left font-normal px-3 py-1.5 w-36 cursor-pointer select-none"
                            (click)="histGrid.toggleSort('tipoEvento', $event)">
                          Tipo {{ histGrid.getSortDir('tipoEvento') === 'asc' ? '↑' : histGrid.getSortDir('tipoEvento') === 'desc' ? '↓' : '' }}
                          @if (histGrid.getSortPriority('tipoEvento')) {<sup class="text-[9px]">{{ histGrid.getSortPriority('tipoEvento') }}</sup>}
                        </th>
                        <th class="text-left font-normal px-3 py-1.5 w-24 cursor-pointer select-none"
                            (click)="histGrid.toggleSort('estadoOrden', $event)">
                          Estado {{ histGrid.getSortDir('estadoOrden') === 'asc' ? '↑' : histGrid.getSortDir('estadoOrden') === 'desc' ? '↓' : '' }}
                          @if (histGrid.getSortPriority('estadoOrden')) {<sup class="text-[9px]">{{ histGrid.getSortPriority('estadoOrden') }}</sup>}
                        </th>
                        <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                            (click)="histGrid.toggleSort('ordenReferencia', $event)">
                          Referencia {{ histGrid.getSortDir('ordenReferencia') === 'asc' ? '↑' : histGrid.getSortDir('ordenReferencia') === 'desc' ? '↓' : '' }}
                          @if (histGrid.getSortPriority('ordenReferencia')) {<sup class="text-[9px]">{{ histGrid.getSortPriority('ordenReferencia') }}</sup>}
                        </th>
                        <th class="text-center font-normal px-3 py-1.5 w-16 cursor-pointer select-none"
                            (click)="histGrid.toggleSort('detalle', $event)">
                          Detalle
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (m of histGrid.sortedData(); track m['id']; let odd = $odd) {
                        <tr [attr.data-id]="m['id']"
                            class="border-b border-border/40 last:border-0"
                            [class.bg-surface-primary]="odd && !histGrid.isSelected(m['id'])"
                            [class.cursor-pointer]="m['ordenId']"
                            [title]="m['ordenId'] ? 'Doble clic para abrir la orden' : ''"
                            (dblclick)="goToOrden($any(m))">
                          <td class="px-3 py-1.5 text-xs whitespace-nowrap">{{ formatDate(m['fecha']) }}</td>
                          <td class="px-3 py-1.5 text-xs">{{ m['tipoEvento'] }}</td>
                          <td class="px-3 py-1.5 text-xs">{{ m['estadoOrden'] ?? '—' }}</td>
                          <td class="px-3 py-1.5 font-mono text-xs">{{ m['ordenReferencia'] ?? '—' }}</td>
                          <td class="px-3 py-1.5 text-xs text-center tabular-nums">{{ m['detalle'] ?? '' }}</td>
                        </tr>
                      }
                    </tbody>
                  </app-historical-grid>
                </div>

                <!-- Adjuntos: notas + documentos + fotos en tab panel -->
                <div [style.display]="activeNode() === 'adjuntos' ? 'flex' : 'none'"
                     class="flex-1 min-h-0 flex-col">
                  <app-standar-tab-panel [recordId]="articuloId()" [appTableId]="articuoAppTableId()" />
                </div>

                <!-- Estadísticas -->
                @if (activeNode() === 'estadisticas') {
                  <div class="flex-1 flex flex-col min-h-0">
                    <div class="flex items-center gap-2 px-3 h-9 shrink-0 bg-[#005a3b] text-white text-xs font-semibold">
                      <ng-icon hlmIcon size="sm" name="lucideBarChart2" />
                      Estadísticas
                    </div>
                    <div class="flex-1 overflow-auto p-4">
                      <div class="grid grid-cols-2 gap-3">
                        <div class="rounded-md border border-border p-3 space-y-1">
                          <p class="text-xs text-muted-foreground uppercase tracking-wide">Estado actual</p>
                          <p class="text-sm font-medium text-[#005a3b]">{{ estadoActual() || '—' }}</p>
                        </div>
                        <div class="rounded-md border border-border p-3 space-y-1">
                          <p class="text-xs text-muted-foreground uppercase tracking-wide">Almacén actual</p>
                          <p class="text-sm font-medium text-[#005a3b]">{{ almacenNombre() || '—' }}</p>
                        </div>
                        <div class="rounded-md border border-border p-3 space-y-1">
                          <p class="text-xs text-muted-foreground uppercase tracking-wide">Total movimientos</p>
                          <p class="text-2xl font-bold text-[#005a3b] tabular-nums">{{ historial().length }}</p>
                        </div>
                        <div class="rounded-md border border-border p-3 space-y-1">
                          <p class="text-xs text-muted-foreground uppercase tracking-wide">Préstamos realizados</p>
                          <p class="text-2xl font-bold text-[#005a3b] tabular-nums">{{ statNumPrestamos() }}</p>
                        </div>
                        <div class="rounded-md border border-border p-3 space-y-1">
                          <p class="text-xs text-muted-foreground uppercase tracking-wide">Primer movimiento</p>
                          <p class="text-sm font-medium text-[#005a3b]">{{ formatDate(historial().length > 0 ? historial()[historial().length - 1].fecha : null) }}</p>
                        </div>
                        <div class="rounded-md border border-border p-3 space-y-1">
                          <p class="text-xs text-muted-foreground uppercase tracking-wide">Último movimiento</p>
                          <p class="text-sm font-medium text-[#005a3b]">{{ formatDate(historial().length > 0 ? historial()[0].fecha : null) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                }

              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `,
})
export class ItemFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName  = 't100_articulos';
  protected override readonly icon              = 'lucidePackage';
  protected override readonly labelSingular     = 'Artículo';
  protected override readonly defaultBackRoute  = '/inventory/items';
  override entityDescription(): string { return this.serialNumber(); }

  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly http        = inject(HttpClient);
  private readonly api         = inject(ApiService);
  private readonly appTableSvc = inject(AppTableService);

  readonly isView = computed(() => !!this.route.snapshot.paramMap.get('id'));

  readonly articuloId         = signal<string | null>(null);
  readonly serialNumber       = signal('');
  readonly tipoMaterialNombre = signal('');
  readonly brandName          = signal('');
  readonly modeloDescripcion  = signal('');
  readonly almacenNombre      = signal('');
  readonly estadoActual       = signal('');
  readonly articuoAppTableId  = signal<string | null>(null);

  readonly fotos            = signal<PictureItem[]>([]);
  readonly loadingFotos     = signal(false);
  readonly historial        = signal<Movimiento[]>([]);
  readonly loadingHistorial = signal(false);

  readonly activeNode = signal<string>('historial');

  readonly statNumPrestamos = computed(() =>
    this.historial().filter(m => m.tipoEvento === 'Préstamo').length
  );

  readonly articuloDescription = computed(() =>
    [this.tipoMaterialNombre(), this.brandName(), this.modeloDescripcion(), this.serialNumber()]
      .filter(v => v?.trim()).join(' · ')
  );

  readonly treeNodes: DetailTreeNode[] = [
    { id: 'historial',    label: 'Historial',    icon: 'lucideHistory',   count: () => this.historial().length },
    { id: 'adjuntos',     label: 'Adjuntos',     icon: 'lucideLayoutList', count: () => 0 },
    { id: 'estadisticas', label: 'Estadísticas', icon: 'lucideBarChart2', count: () => 0 },
  ];

  ngOnInit(): void {
    this.loadFormMeta();
    if (this.isView()) this.formReadonly.set(true);
    if (!this.isView()) { this.loading.set(false); return; }

    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.articuloId.set(id);

    this.http.get<Articulo>(`${API}/${id}`).subscribe({
      next: data => {
        this.serialNumber.set(data.serialNumber ?? '');
        this.tipoMaterialNombre.set(data.tipoMaterialNombre ?? '');
        this.brandName.set(data.brandName ?? '');
        this.modeloDescripcion.set(data.modeloDescripcion ?? '');
        this.almacenNombre.set(data.almacenNombre ?? '');
        this.estadoActual.set(data.estadoActual ?? '');
        this.loading.set(false);
      },
      error: () => { this.loadError.set('No se pudo cargar el artículo.'); this.loading.set(false); },
    });

    this.loadingHistorial.set(true);
    this.http.get<Movimiento[]>(`${API}/${id}/historial`).subscribe({
      next: data => { this.historial.set(data); this.loadingHistorial.set(false); },
      error: ()   => this.loadingHistorial.set(false),
    });

    this.appTableSvc.getByTableName('t100_articulos').subscribe({
      next: table => {
        this.articuoAppTableId.set(table.id);

        this.loadingFotos.set(true);
        this.api.get<FotoResponse[]>(`/inventory/pictures?tableId=${table.id}&recordId=${id}`).subscribe({
          next: fotos => {
            this.fotos.set(fotos.map(f => ({
              id: f.id, filePath: f.filePath, pictureTypeName: f.pictureTypeName,
              esPrincipal: f.esPrincipal, caption: f.caption,
              filename: f.originalFilename, createdAt: f.createdAt,
            })));
            this.loadingFotos.set(false);
          },
          error: () => this.loadingFotos.set(false),
        });
      },
    });
  }

  onPictureAdded(pic: PictureItem): void {
    this.fotos.update(list => [pic, ...list]);
  }

  onDeleteFoto(id: string): void {
    this.api.delete(`/inventory/pictures/${id}`).subscribe({
      next: () => this.fotos.update(list => list.filter(f => f.id !== id)),
    });
  }

  onSetPrincipal(id: string): void {
    this.api.patch<FotoResponse>(`/inventory/pictures/${id}/set-principal`, {}).subscribe({
      next: () => this.fotos.update(list => list.map(f => ({ ...f, esPrincipal: f.id === id }))),
    });
  }

  goToOrden(m: Movimiento): void {
    if (!m.ordenId) return;
    const readonly = m.estadoOrden === 'COM' || m.estadoOrden === 'CAN';
    switch (m.ordenCategoria) {
      case 'prestamo': {
        const esDevolucion = String(m.tipoEvento ?? '').toLowerCase().includes('devoluc');
        if (esDevolucion) {
          this.router.navigate(['/inventory/orders/loans', m.ordenId, 'devolucion']);
        } else {
          this.router.navigate(['/inventory/orders/loans', m.ordenId],
            readonly ? { queryParams: { readonly: 'true' } } : {});
        }
        break;
      }
      case 'devolucion':  this.router.navigate(['/inventory/orders/returns']); break;
      case 'entrada':     this.router.navigate(['/inventory/orders/warehouse-entries']); break;
      case 'baja':        this.router.navigate(['/inventory/orders/decommissions']); break;
      default:            this.router.navigate(['/inventory/orders']);
    }
  }

  formatDate(iso: unknown): string {
    if (!iso) return '—';
    return new Date(String(iso)).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
