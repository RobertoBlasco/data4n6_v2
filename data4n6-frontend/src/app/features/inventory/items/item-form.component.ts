import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucidePackage, lucideHistory, lucideBarChart2,
  lucideStickyNote, lucideFileText, lucideImage,
  lucideChevronRight, lucideUpload, lucideX, lucideExternalLink,
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
import { AppTableService } from '../../../core/services/app-table.service';
import { ApiService } from '../../../core/services/api.service';

interface NotaResponse {
  id: string;
  body: string;
  createdAt: string;
}

interface DocumentoResponse {
  id: string;
  documentTypeId:   string | null;
  documentTypeName: string | null;
  title:            string;
  originalFilename: string;
  filePath:         string;
  description:      string | null;
  fileSizeBytes:    number | null;
  createdAt:        string;
}

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
    NgClass, FormsModule,
    HlmButtonImports, HlmLabelImports, HlmInputImports,
    HlmSpinnerImports, HlmIconImports,
    SpaFormHeaderComponent, FormReadonlyDirective,
    PicturePanelComponent,
    HistoricalGridComponent,
    SectionHeaderComponent,
    DetailTreeComponent,
    QuillEditorComponent,
  ],
  providers: [provideIcons({
    lucidePackage, lucideHistory, lucideBarChart2,
    lucideStickyNote, lucideFileText, lucideImage,
    lucideChevronRight, lucideUpload, lucideX, lucideExternalLink,
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

      <!-- Cuerpo -->
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

              <!-- Fila superior: Fotos + Datos generales -->
              <div class="flex gap-6 items-stretch shrink-0">

                <!-- Fotos -->
                <div class="w-64 flex flex-col">
                  <app-picture-panel class="flex-1"
                    title="Fotos" icon="lucideImage"
                    [appTableId]="articuoAppTableId ?? ''"
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

              <!-- Árbol de detalles -->
              <app-detail-tree
                [nodes]="treeNodes"
                [activeId]="activeNode()"
                (activeIdChange)="activeNode.set($event)" />

            </div>

            <!-- ── CONTENIDO del nodo seleccionado (flex-1) ───────────────── -->
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
                          Detalle {{ histGrid.getSortDir('detalle') === 'asc' ? '↑' : histGrid.getSortDir('detalle') === 'desc' ? '↓' : '' }}
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

                <!-- Notas -->
                <div [style.display]="activeNode() === 'notas' ? 'flex' : 'none'"
                     class="flex-1 min-h-0 flex-col gap-2">
                  <app-section-header title="Notas" icon="lucideStickyNote"
                    [showAdd]="true" (add)="showNuevaNota.set(true)" />
                  <app-historical-grid #notasGrid
                    [loading]="loadingNotas()"
                    [data]="$any(notas())"
                    [selectable]="true"
                    emptyMessage="Sin notas registradas">
                    <thead class="bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1.5 w-36 whitespace-nowrap cursor-pointer select-none"
                            (click)="notasGrid.toggleSort('createdAt', $event)">
                          Fecha {{ notasGrid.getSortDir('createdAt') === 'asc' ? '↑' : notasGrid.getSortDir('createdAt') === 'desc' ? '↓' : '' }}
                        </th>
                        <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                            (click)="notasGrid.toggleSort('body', $event)">
                          Nota {{ notasGrid.getSortDir('body') === 'asc' ? '↑' : notasGrid.getSortDir('body') === 'desc' ? '↓' : '' }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (n of notasGrid.sortedData(); track n['id']; let odd = $odd) {
                        <tr [attr.data-id]="n['id']"
                            class="border-b border-border/40 last:border-0"
                            [class.bg-surface-primary]="odd"
                            (dblclick)="openNotaDetail($any(n))">
                          <td class="px-3 py-1.5 text-xs whitespace-nowrap">{{ formatDate(n['createdAt']) }}</td>
                          <td class="px-3 py-1.5 text-xs" [innerHTML]="n['body']"></td>
                        </tr>
                      }
                    </tbody>
                  </app-historical-grid>
                </div>

                <!-- Documentos: grid (mitad superior) + metadata+preview (mitad inferior) -->
                <div [style.display]="activeNode() === 'documentos' ? 'flex' : 'none'"
                     class="flex-1 min-h-0 flex-col">

                  <!-- Rejilla -->
                  <div class="flex-1 min-h-0 flex flex-col gap-2">
                    <app-section-header title="Documentos" icon="lucideFileText"
                      [showAdd]="true" (add)="showNuevoDoc.set(true)" />
                    <app-historical-grid #docsGrid
                      [loading]="loadingDocumentos()"
                      [data]="$any(documentos())"
                      emptyMessage="Sin documentos adjuntos">
                      <thead class="bg-[#005a3b] text-white">
                        <tr>
                          <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                              (click)="docsGrid.toggleSort('originalFilename', $event)">
                            Archivo {{ docsGrid.getSortDir('originalFilename') === 'asc' ? '↑' : docsGrid.getSortDir('originalFilename') === 'desc' ? '↓' : '' }}
                          </th>
                          <th class="text-left font-normal px-3 py-1.5 w-32 cursor-pointer select-none"
                              (click)="docsGrid.toggleSort('documentTypeName', $event)">
                            Tipo {{ docsGrid.getSortDir('documentTypeName') === 'asc' ? '↑' : docsGrid.getSortDir('documentTypeName') === 'desc' ? '↓' : '' }}
                          </th>
                          <th class="text-left font-normal px-3 py-1.5 w-36 whitespace-nowrap cursor-pointer select-none"
                              (click)="docsGrid.toggleSort('createdAt', $event)">
                            Fecha {{ docsGrid.getSortDir('createdAt') === 'asc' ? '↑' : docsGrid.getSortDir('createdAt') === 'desc' ? '↓' : '' }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (d of docsGrid.sortedData(); track d['id']; let odd = $odd) {
                          <tr class="border-b border-border/40 last:border-0 cursor-pointer"
                              [class.bg-surface-primary]="odd && selectedDoc()?.id !== d['id']"
                              [class.bg-action/25]="selectedDoc()?.id === d['id']"
                              (click)="selectDoc($any(d))">
                            <td class="px-3 py-1.5 text-xs truncate">{{ d['originalFilename'] }}</td>
                            <td class="px-3 py-1.5 text-xs">{{ d['documentTypeName'] ?? '—' }}</td>
                            <td class="px-3 py-1.5 text-xs whitespace-nowrap">{{ formatDate(d['createdAt']) }}</td>
                          </tr>
                        }
                      </tbody>
                    </app-historical-grid>
                  </div>

                  <!-- Mitad inferior: metadata + preview -->
                  <div class="flex-1 min-h-0 flex gap-0 border-t-2 border-primary mt-1">

                    <!-- Metadata -->
                    <div class="w-64 shrink-0 flex flex-col border-r border-border bg-muted/20 overflow-auto">
                      <div class="px-3 h-8 flex items-center bg-[#005a3b] text-white text-xs font-semibold shrink-0">
                        Metadatos
                      </div>
                      @if (selectedDoc(); as doc) {
                        <div class="p-3 space-y-3 text-xs">
                          <div>
                            <p class="text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">Archivo</p>
                            <p class="text-[#005a3b] break-all">{{ doc.originalFilename }}</p>
                          </div>
                          <div>
                            <p class="text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">Tipo</p>
                            <p class="text-[#005a3b]">{{ doc.documentTypeName || '—' }}</p>
                          </div>
                          <div>
                            <p class="text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">Descripción</p>
                            <p class="text-[#005a3b]">{{ doc.description || '—' }}</p>
                          </div>
                          <div>
                            <p class="text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">Fecha</p>
                            <p class="text-[#005a3b]">{{ formatDate(doc.createdAt) }}</p>
                          </div>
                          <div class="pt-1">
                            <button hlmBtn variant="outline" size="sm" class="w-full h-7 text-xs"
                              (click)="openDocViewer(doc)">
                              <ng-icon hlmIcon size="sm" name="lucideExternalLink" class="mr-1" />
                              Ver a pantalla completa
                            </button>
                          </div>
                        </div>
                      } @else {
                        <p class="p-3 text-xs text-muted-foreground italic">Selecciona un documento</p>
                      }
                    </div>

                    <!-- Previsualización -->
                    <div class="flex-1 min-h-0 flex flex-col overflow-hidden bg-gray-100">
                      <div class="px-3 h-8 flex items-center bg-[#005a3b] text-white text-xs font-semibold shrink-0">
                        Previsualización
                      </div>
                      <div class="flex-1 min-h-0 overflow-auto">
                        @if (!selectedDoc()) {
                          <div class="flex items-center justify-center h-full text-xs text-muted-foreground italic">
                            Selecciona un documento para previsualizarlo
                          </div>
                        } @else if (loadingDocPreview()) {
                          <div class="flex items-center justify-center h-full gap-2 text-muted-foreground">
                            <hlm-spinner /><span class="text-xs">Cargando...</span>
                          </div>
                        } @else if (isPdf(selectedDoc()!.filePath)) {
                          <iframe [src]="safeDocUrl()"
                            class="w-full h-full border-0" title="Preview"></iframe>
                        } @else if (selectedDocHtml()) {
                          <div class="p-4 bg-white text-xs leading-relaxed max-w-full overflow-auto"
                               [innerHTML]="selectedDocHtml()"></div>
                        } @else {
                          <div class="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                            <ng-icon hlmIcon size="lg" name="lucideFileText" class="opacity-25" />
                            <p class="text-xs">Sin previsualización disponible</p>
                          </div>
                        }
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Fotos -->
                <div [style.display]="activeNode() === 'fotos' ? 'flex' : 'none'"
                     class="flex-1 min-h-0 flex-col gap-2">
                  <app-section-header title="Fotos" icon="lucideImage" />
                  <app-historical-grid #fotosGrid
                    [loading]="loadingFotos()"
                    [data]="$any(fotos())"
                    [selectable]="true"
                    emptyMessage="Sin fotos registradas">
                    <thead class="bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1.5 w-8 cursor-pointer select-none"
                            (click)="fotosGrid.toggleSort('esPrincipal', $event)">
                          ★
                        </th>
                        <th class="text-left font-normal px-3 py-1.5 cursor-pointer select-none"
                            (click)="fotosGrid.toggleSort('filename', $event)">
                          Archivo {{ fotosGrid.getSortDir('filename') === 'asc' ? '↑' : fotosGrid.getSortDir('filename') === 'desc' ? '↓' : '' }}
                        </th>
                        <th class="text-left font-normal px-3 py-1.5 w-36 whitespace-nowrap cursor-pointer select-none"
                            (click)="fotosGrid.toggleSort('createdAt', $event)">
                          Fecha {{ fotosGrid.getSortDir('createdAt') === 'asc' ? '↑' : fotosGrid.getSortDir('createdAt') === 'desc' ? '↓' : '' }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (f of fotosGrid.sortedData(); track f['id']; let odd = $odd) {
                        <tr [attr.data-id]="f['id']"
                            class="border-b border-border/40 last:border-0"
                            [class.bg-surface-primary]="odd">
                          <td class="px-3 py-1.5 text-yellow-500 text-xs">{{ f['esPrincipal'] ? '★' : '' }}</td>
                          <td class="px-3 py-1.5 text-xs truncate">{{ f['filename'] }}</td>
                          <td class="px-3 py-1.5 text-xs whitespace-nowrap">{{ formatDate(f['createdAt']) }}</td>
                        </tr>
                      }
                    </tbody>
                  </app-historical-grid>
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

    <!-- ── Diálogo: Detalle de nota ─────────────────────────────────── -->
    @if (showNotaDetalle() && notaDetalle()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
           (click)="showNotaDetalle.set(false)">
        <div class="bg-background rounded-lg shadow-xl p-0 flex flex-col overflow-hidden"
             style="width: 80vw; max-width: 1200px; height: 70vh;"
             (click)="$event.stopPropagation()">
          <div class="bg-[#005a3b] text-white flex items-center justify-between px-4 h-11 shrink-0">
            <div class="flex items-center gap-2">
              <ng-icon hlmIcon size="sm" name="lucideStickyNote" />
              <span class="text-sm font-semibold">Nota — {{ formatDate(notaDetalle()!.createdAt) }}</span>
            </div>
            <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-white/15 text-white"
              (click)="showNotaDetalle.set(false)">
              <ng-icon hlmIcon size="sm" name="lucideX" />
            </button>
          </div>
          <div class="flex-1 overflow-auto p-6 bg-white prose prose-sm max-w-none text-sm leading-relaxed"
               [innerHTML]="notaDetalle()!.body">
          </div>
        </div>
      </div>
    }

    <!-- ── Diálogo: Nueva nota ──────────────────────────────────────── -->
    @if (showNuevaNota()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
           (click)="showNuevaNota.set(false)">
        <div class="bg-background rounded-lg shadow-xl p-0 flex flex-col overflow-auto"
             style="resize: both; width: 95vw; max-width: 1400px; min-width: 600px; height: 80vh; min-height: 400px;"
             (click)="$event.stopPropagation()">
          <div class="bg-[#005a3b] text-white flex items-center gap-2 px-4 h-11 shrink-0">
            <ng-icon hlmIcon size="sm" name="lucideStickyNote" />
            <h2 class="text-sm font-semibold">Nueva nota</h2>
          </div>
          <div class="flex-1 p-4 min-h-0 flex flex-col">
            <quill-editor
              [(ngModel)]="nuevaNotaBody"
              placeholder="Escribe la nota..."
              [styles]="{ flex: '1', 'min-height': '0' }"
              [modules]="{
                toolbar: [
                  [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ color: [] }, { background: [] }],
                  [{ script: 'sub' }, { script: 'super' }],
                  ['blockquote', 'code-block'],
                  [{ header: 1 }, { header: 2 }],
                  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                  [{ align: [] }],
                  ['link'],
                  ['clean']
                ]
              }" />
          </div>
          <div class="flex items-center justify-end gap-2 px-4 pb-4 shrink-0">
            <button hlmBtn variant="outline" size="sm" (click)="showNuevaNota.set(false)">Cancelar</button>
            <button hlmBtn size="sm" [disabled]="savingNota() || !nuevaNotaBody.trim()" (click)="guardarNota()">
              @if (savingNota()) { <hlm-spinner class="mr-1" /> } Guardar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Diálogo: Nuevo documento ────────────────────────────────── -->
    @if (showNuevoDoc()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
           (click)="showNuevoDoc.set(false)">
        <div class="bg-background rounded-lg shadow-xl w-[36rem] p-0 overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="bg-[#005a3b] text-white flex items-center gap-2 px-4 h-11">
            <ng-icon hlmIcon size="sm" name="lucideFileText" />
            <h2 class="text-sm font-semibold">Subir documento</h2>
          </div>
          <div class="p-5 space-y-4">

            <!-- Zona drag & drop -->
            <div class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
                 [ngClass]="nuevoDocFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted/30'"
                 (click)="docFileInput.click()"
                 (dragover)="$event.preventDefault()"
                 (drop)="$event.preventDefault(); nuevoDocFile = $event.dataTransfer?.files?.item(0) ?? null">
              <input #docFileInput type="file" class="hidden"
                (change)="nuevoDocFile = $any($event.target).files[0]" />
              @if (nuevoDocFile) {
                <div class="flex flex-col items-center gap-2">
                  <ng-icon hlmIcon size="lg" name="lucideFileText" class="text-[#005a3b]" />
                  <p class="text-sm font-medium text-[#005a3b]">{{ nuevoDocFile.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ (nuevoDocFile.size / 1024).toFixed(1) }} KB</p>
                  <button hlmBtn variant="ghost" size="sm" class="text-xs text-destructive"
                    (click)="$event.stopPropagation(); nuevoDocFile = null">Quitar</button>
                </div>
              } @else {
                <div class="flex flex-col items-center gap-2 text-muted-foreground">
                  <ng-icon hlmIcon size="lg" name="lucideUpload" class="opacity-40" />
                  <p class="text-sm">Arrastra un fichero aquí o haz clic para seleccionar</p>
                </div>
              }
            </div>

            <!-- Tipo de documento -->
            <div class="space-y-1.5">
              <label hlmLabel>Tipo de documento</label>
              <select class="w-full h-9 rounded-md border border-primary bg-action/5 px-3 text-sm text-[#005a3b] focus:outline-none"
                [(ngModel)]="nuevoDocTipo">
                <option value="">— Sin tipo —</option>
                @for (t of tiposDoc(); track t.id) {
                  <option [value]="t.id">{{ t.name }}</option>
                }
              </select>
            </div>

            <!-- Descripción -->
            <div class="space-y-1.5">
              <label hlmLabel>Descripción</label>
              <input hlmInput class="w-full" placeholder="Descripción opcional..."
                [(ngModel)]="nuevoDocDesc" />
            </div>

          </div>
          <div class="flex items-center justify-end gap-2 px-5 pb-5">
            <button hlmBtn variant="outline" size="sm" (click)="showNuevoDoc.set(false)">Cancelar</button>
            <button hlmBtn size="sm" [disabled]="savingDoc() || !nuevoDocFile" (click)="guardarDocumento()">
              @if (savingDoc()) { <hlm-spinner class="mr-1" /> } Subir
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Viewer de documento ─────────────────────────────────────── -->
    @if (viewerUrl()) {
      <div class="fixed inset-0 z-50 flex flex-col bg-black/60"
           (click)="closeDocViewer()">
        <div class="flex-1 flex flex-col m-6 bg-background rounded-lg shadow-xl overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-4 h-11 bg-[#005a3b] text-white shrink-0">
            <div class="flex items-center gap-2">
              <ng-icon hlmIcon size="sm" name="lucideFileText" />
              <span class="text-sm font-medium">{{ viewerFilename() }}</span>
            </div>
            <div class="flex items-center gap-2">
              <a [href]="viewerUrl()!" target="_blank" download
                 class="text-white/80 hover:text-white text-xs underline">
                Descargar
              </a>
              <button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-white/15 hover:text-white text-white"
                (click)="closeDocViewer()">
                <ng-icon hlmIcon size="sm" name="lucideX" />
              </button>
            </div>
          </div>
          <div class="flex-1 min-h-0 bg-gray-100 overflow-auto">
            @if (isPdf(viewerUrl()!)) {
              <iframe [src]="safeViewerUrl()!" class="w-full h-full border-0" title="Documento"></iframe>
            } @else if (isDocx(viewerUrl()!)) {
              @if (viewerLoading()) {
                <div class="flex items-center justify-center h-full gap-3 text-muted-foreground">
                  <hlm-spinner /><span class="text-sm">Convirtiendo documento...</span>
                </div>
              } @else if (viewerDocxHtml()) {
                <div class="max-w-4xl mx-auto p-8 bg-white shadow-sm my-4 text-sm leading-relaxed"
                     [innerHTML]="viewerDocxHtml()"></div>
              } @else {
                <div class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <ng-icon hlmIcon size="lg" name="lucideFileText" class="opacity-30" />
                  <p class="text-sm">No se pudo previsualizar el documento</p>
                  <a [href]="viewerUrl()!" download class="text-xs text-[#005a3b] underline">Descargar</a>
                </div>
              }
            } @else {
              <div class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <ng-icon hlmIcon size="lg" name="lucideFileText" class="opacity-30" />
                <p class="text-sm">Formato no previsualizable</p>
                <a [href]="viewerUrl()!" download class="text-xs text-[#005a3b] underline">Descargar</a>
              </div>
            }
          </div>
        </div>
      </div>
    }
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
  private readonly sanitizer   = inject(DomSanitizer);

  readonly isView = computed(() => !!this.route.snapshot.paramMap.get('id'));

  readonly articuloId         = signal<string | null>(null);
  readonly serialNumber       = signal('');
  readonly tipoMaterialNombre = signal('');
  readonly brandName          = signal('');
  readonly modeloDescripcion  = signal('');
  readonly almacenNombre      = signal('');
  readonly estadoActual       = signal('');

  readonly fotos             = signal<PictureItem[]>([]);
  readonly loadingFotos      = signal(false);
  readonly historial         = signal<Movimiento[]>([]);
  readonly loadingHistorial  = signal(false);
  readonly notas             = signal<NotaResponse[]>([]);
  readonly loadingNotas      = signal(false);
  readonly documentos        = signal<DocumentoResponse[]>([]);
  readonly loadingDocumentos = signal(false);

  readonly activeNode = signal<string>('historial');

  readonly statNumPrestamos = computed(() =>
    this.historial().filter(m => m.tipoEvento === 'Préstamo').length
  );

  readonly articuloDescription = computed(() =>
    [
      this.tipoMaterialNombre(),
      this.brandName(),
      this.modeloDescripcion(),
      this.serialNumber(),
    ].filter(v => v?.trim()).join(' · ')
  );

  // Documento seleccionado para panel de previsualización
  readonly selectedDoc       = signal<DocumentoResponse | null>(null);
  readonly selectedDocHtml   = signal<SafeHtml | null>(null);
  readonly loadingDocPreview = signal(false);
  readonly safeDocUrl        = computed((): SafeResourceUrl | null =>
    this.selectedDoc()
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedDoc()!.filePath)
      : null
  );

  // Viewer a pantalla completa
  readonly viewerUrl      = signal<string | null>(null);
  readonly viewerFilename = signal<string>('');
  readonly viewerDocxHtml = signal<SafeHtml | null>(null);
  readonly viewerLoading  = signal(false);
  readonly safeViewerUrl  = computed((): SafeResourceUrl | null =>
    this.viewerUrl()
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.viewerUrl()!)
      : null
  );

  // Diálogo nueva nota
  readonly showNuevaNota = signal(false);
  nuevaNotaBody          = '';
  readonly savingNota    = signal(false);

  // Diálogo detalle nota
  readonly showNotaDetalle = signal(false);
  readonly notaDetalle     = signal<NotaResponse | null>(null);

  // Diálogo nuevo documento
  readonly showNuevoDoc = signal(false);
  nuevoDocTipo          = '';
  nuevoDocDesc          = '';
  nuevoDocFile: File | null = null;
  readonly savingDoc    = signal(false);
  readonly tiposDoc     = signal<{id: string; name: string}[]>([]);

  readonly treeNodes: DetailTreeNode[] = [
    { id: 'historial'    as const, label: 'Historial',    icon: 'lucideHistory',    count: () => this.historial().length },
    { id: 'notas'        as const, label: 'Notas',        icon: 'lucideStickyNote', count: () => this.notas().length },
    { id: 'documentos'   as const, label: 'Documentos',   icon: 'lucideFileText',   count: () => this.documentos().length },
    { id: 'fotos'        as const, label: 'Fotos',        icon: 'lucideImage',      count: () => this.fotos().length },
    { id: 'estadisticas' as const, label: 'Estadísticas', icon: 'lucideBarChart2',  count: () => 0 },
  ];

  articuoAppTableId: string | null = null;

  ngOnInit(): void {
    this.loadFormMeta();
    // Los artículos son siempre solo lectura
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

    this.api.get<{id: string; name: string}[]>('/catalog/document-types').subscribe({
      next: data => this.tiposDoc.set(data),
    });

    this.loadingHistorial.set(true);
    this.http.get<Movimiento[]>(`${API}/${id}/historial`).subscribe({
      next: data => { this.historial.set(data); this.loadingHistorial.set(false); },
      error: ()   => this.loadingHistorial.set(false),
    });

    this.appTableSvc.getByTableName('t100_articulos').subscribe({
      next: table => {
        this.articuoAppTableId = table.id;

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

        this.loadingNotas.set(true);
        this.api.get<NotaResponse[]>(`/inventory/notes?tableId=${table.id}&recordId=${id}`).subscribe({
          next: data => { this.notas.set(data); this.loadingNotas.set(false); },
          error: ()   => this.loadingNotas.set(false),
        });

        this.loadingDocumentos.set(true);
        this.api.get<DocumentoResponse[]>(`/inventory/documents?tableId=${table.id}&recordId=${id}`).subscribe({
          next: data => { this.documentos.set(data); this.loadingDocumentos.set(false); },
          error: ()   => this.loadingDocumentos.set(false),
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
          // El evento es una devolución; ordenId ya es el ID de la orden de préstamo
          this.router.navigate(['/inventory/orders/loans', m.ordenId, 'devolucion']);
        } else {
          this.router.navigate(['/inventory/orders/loans', m.ordenId],
            readonly ? { queryParams: { readonly: 'true' } } : {});
        }
        break;
      }
      case 'devolucion':
        this.router.navigate(['/inventory/orders/returns']);
        break;
      case 'entrada':
        this.router.navigate(['/inventory/orders/warehouse-entries']);
        break;
      case 'baja':
        this.router.navigate(['/inventory/orders/decommissions']);
        break;
      default:
        this.router.navigate(['/inventory/orders']);
    }
  }

  openNotaDetail(nota: NotaResponse): void {
    this.notaDetalle.set(nota);
    this.showNotaDetalle.set(true);
  }

  guardarNota(): void {
    if (!this.nuevaNotaBody.trim() || !this.articuoAppTableId) return;
    this.savingNota.set(true);
    this.api.post<NotaResponse>('/inventory/notes', {
      appTableId: this.articuoAppTableId,
      recordId:   this.articuloId()!,
      body:       this.nuevaNotaBody.trim(),
    }).subscribe({
      next: nota => {
        this.notas.update(list => [nota, ...list]);
        this.nuevaNotaBody = '';
        this.showNuevaNota.set(false);
        this.savingNota.set(false);
      },
      error: () => this.savingNota.set(false),
    });
  }

  guardarDocumento(): void {
    if (!this.nuevoDocFile || !this.articuoAppTableId) return;
    this.savingDoc.set(true);
    const form = new FormData();
    form.append('file',        this.nuevoDocFile);
    form.append('appTableId',  this.articuoAppTableId);
    form.append('recordId',    this.articuloId()!);
    if (this.nuevoDocTipo) form.append('documentTypeId', this.nuevoDocTipo);
    if (this.nuevoDocDesc) form.append('description',    this.nuevoDocDesc);
    this.http.post<DocumentoResponse>(
      'http://localhost:8080/api/v1/inventory/documents/upload', form
    ).subscribe({
      next: doc => {
        this.documentos.update(list => [doc, ...list]);
        this.nuevoDocTipo = ''; this.nuevoDocDesc = ''; this.nuevoDocFile = null;
        this.showNuevoDoc.set(false);
        this.savingDoc.set(false);
      },
      error: () => this.savingDoc.set(false),
    });
  }

  async selectDoc(doc: DocumentoResponse): Promise<void> {
    this.selectedDoc.set(doc);
    this.selectedDocHtml.set(null);
    if (this.isDocx(doc.filePath)) {
      this.loadingDocPreview.set(true);
      try {
        const mammoth = await import('mammoth');
        const response = await fetch(doc.filePath);
        const ab = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: ab });
        this.selectedDocHtml.set(this.sanitizer.bypassSecurityTrustHtml(result.value));
      } catch { this.selectedDocHtml.set(null); }
      finally { this.loadingDocPreview.set(false); }
    }
  }

  openDocViewer(doc: DocumentoResponse): void {
    this.viewerUrl.set(doc.filePath);
    this.viewerFilename.set(doc.originalFilename);
    this.viewerDocxHtml.set(null);
    if (this.isDocx(doc.filePath)) this.loadDocx(doc.filePath);
  }

  closeDocViewer(): void {
    this.viewerUrl.set(null);
    this.viewerDocxHtml.set(null);
  }

  isPdf(url: string): boolean  { return /\.pdf($|\?)/i.test(url); }
  isDocx(url: string): boolean { return /\.docx($|\?)/i.test(url); }

  private async loadDocx(url: string): Promise<void> {
    this.viewerLoading.set(true);
    try {
      const mammoth = await import('mammoth');
      const response = await fetch(url);
      const ab = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: ab });
      this.viewerDocxHtml.set(this.sanitizer.bypassSecurityTrustHtml(result.value));
    } catch { this.viewerDocxHtml.set(null); }
    finally { this.viewerLoading.set(false); }
  }

  formatDate(iso: unknown): string {
    if (!iso) return '—';
    return new Date(String(iso)).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
