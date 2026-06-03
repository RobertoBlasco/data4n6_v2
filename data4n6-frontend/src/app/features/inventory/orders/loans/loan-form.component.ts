import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal, effect, untracked,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SlicePipe } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { lucideHandshake, lucideX, lucideBoxes, lucideListChecks, lucideChartBar, lucideBuilding2, lucideUserCheck, lucideClipboard, lucideUserPlus, lucideUndo2, lucideArrowLeftRight } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { SpaFormHeaderComponent } from '../../../../shared/form/spa-form-header.component';
import { FkComboboxComponent } from '../../../../shared/components/fk-combobox/fk-combobox.component';
import { ArticuloPickerComponent, ArticuloMin } from '../../shared/articulo-picker/articulo-picker.component';

const BASE          = 'http://localhost:8080/api/v1';
const API_PRESTAMOS = `${BASE}/inventory/ordenes-prestamo`;
const API_ARTICULOS = `${BASE}/inventory/articulos`;

interface LineaPrestamoDetalle {
  id: string;
  articuloId: string | null;
  articuloSerialNumber: string | null;
  tipoMaterialNombre: string | null;
  marcaNombre: string | null;
  modeloDescripcion: string | null;
  almacenNombre: string | null;
  devuelta: boolean;
  ordenDevolucionReferencia: string | null;
  fechaDevolucion: string | null;
}

type LineaPrestamoMin = LineaPrestamoDetalle;

interface OrdenPrestamoDetail {
  id: string;
  numeroReferencia: string;
  estadoOrdenNombre: string | null;
  unidadOrigenId: string | null; unidadOrigenNombre: string | null;
  agenteOrigenId: string | null; agenteOrigenNombre: string | null;
  unidadDestinoId: string | null; unidadDestinoNombre: string | null;
  agenteDestinoId: string | null; agenteDestinoNombre: string | null;
  fechaInicio: string | null;
  fechaDevolucion: string | null;
  casosId: string | null; casosReference: string | null;
}

@Component({
  selector: 'app-loan-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports, HlmLabelImports,
    HlmSpinnerImports, HlmInputImports, HlmIconImports,
    SpaFormHeaderComponent, FkComboboxComponent,
    ArticuloPickerComponent, SlicePipe,
  ],
  providers: [provideIcons({ lucideHandshake, lucideX, lucideBoxes, lucideListChecks, lucideChartBar, lucideBuilding2, lucideUserCheck, lucideClipboard, lucideUserPlus, lucideUndo2, lucideArrowLeftRight })],
  template: `
    <div class="h-full flex flex-col min-h-0">

      <app-spa-form-header
        icon="lucideHandshake"
        [label]="headerLabel()"
        backRoute="/inventory/orders/loans" />

      <div class="flex-1 flex min-h-0">

        <!-- ── Columna izquierda: campos ──────────────────────────────────── -->
        <div class="w-[27rem] shrink-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-5">

          @if (saveError() && !isView()) {
            <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ saveError() }}
            </div>
          }

          <!-- Origen -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideBuilding2" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Origen</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
              <label hlmLabel class="pt-2 whitespace-nowrap">Unidad @if (!isView()) { <span class="text-destructive ml-0.5">*</span> }</label>
              <div>
                @if (isView()) {
                  <input hlmInput readonly class="w-full" style="background-color: #f0f0f0" [value]="unidadOrigenNombre() || '—'" />
                } @else {
                  <app-fk-combobox endpoint="/catalog/units" [baseUrl]="BASE"
                    [value]="unidadOrigenId()" (valueChange)="unidadOrigenId.set($event)" />
                  @if (origenError()) {
                    <p class="text-xs text-destructive mt-1">Obligatoria.</p>
                  }
                }
              </div>
              <label hlmLabel class="pt-2 pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              @if (isView()) {
                <input hlmInput readonly class="w-full" style="background-color: #f0f0f0" [value]="agenteOrigenNombre() || '—'" />
              } @else {
                <app-fk-combobox [endpoint]="agenteOrigenEndpoint()" [baseUrl]="BASE"
                  [value]="agenteOrigenId()" [disabled]="!unidadOrigenId()"
                  [canCreate]="true" createLabel="Nuevo agente"
                  [refreshKey]="agentRefreshKey()"
                  (valueChange)="agenteOrigenId.set($event)" (create)="openCreateAgent('origen')" />
              }
            </div>
          </div>

          <!-- Destino -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideUserCheck" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Destino</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
              <label hlmLabel class="pt-2 whitespace-nowrap">Unidad @if (!isView()) { <span class="text-destructive ml-0.5">*</span> }</label>
              <div>
                @if (isView()) {
                  <input hlmInput readonly class="w-full" style="background-color: #f0f0f0" [value]="unidadDestinoNombre() || '—'" />
                } @else {
                  <app-fk-combobox endpoint="/catalog/units" [baseUrl]="BASE"
                    [value]="unidadDestinoId()" (valueChange)="unidadDestinoId.set($event)" />
                  @if (destinoError()) {
                    <p class="text-xs text-destructive mt-1">Se requiere unidad u agente.</p>
                  }
                }
              </div>
              <label hlmLabel class="pt-2 pl-4 whitespace-nowrap flex items-center gap-1">
                <span class="text-muted-foreground select-none text-xs">└</span> Agente
              </label>
              @if (isView()) {
                <input hlmInput readonly class="w-full" style="background-color: #f0f0f0" [value]="agenteDestinoNombre() || '—'" />
              } @else {
                <app-fk-combobox [endpoint]="agenteDestinoEndpoint()" [baseUrl]="BASE"
                  [value]="agenteDestinoId()" [disabled]="!unidadDestinoId()"
                  [canCreate]="true" createLabel="Nuevo agente"
                  [refreshKey]="agentRefreshKey()"
                  (valueChange)="agenteDestinoId.set($event)" (create)="openCreateAgent('destino')" />
              }
            </div>
          </div>

          <!-- Datos adicionales -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <ng-icon hlmIcon name="lucideClipboard" size="sm" class="text-[#005a3b] shrink-0" />
              <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Datos adicionales</span>
              <div class="flex-1 h-px bg-border"></div>
            </div>
            <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
              <label hlmLabel class="pt-2 whitespace-nowrap">Inicio @if (!isView()) { <span class="text-destructive ml-0.5">*</span> }</label>
              <div>
                <input hlmInput type="date" class="w-full" [readonly]="isView()"
                  [style.background-color]="isView() ? '#f0f0f0' : null"
                  [value]="fechaInicio()" (change)="fechaInicio.set($any($event.target).value)" />
                @if (fechaInicioError() && !isView()) {
                  <p class="text-xs text-destructive mt-1">Obligatoria.</p>
                }
              </div>
              <label hlmLabel class="pt-2 whitespace-nowrap">Devolución</label>
              <input hlmInput type="date" class="w-full" [readonly]="isView()"
                [style.background-color]="isView() ? '#f0f0f0' : null"
                [value]="fechaDevolucion()" (change)="fechaDevolucion.set($any($event.target).value)" />
              <label hlmLabel class="pt-2 whitespace-nowrap">Caso</label>
              @if (isView()) {
                <input hlmInput readonly class="w-full" style="background-color: #f0f0f0" [value]="casosReference() || '—'" />
              } @else {
                <div class="space-y-2">
                  <app-fk-combobox endpoint="/cases" displayField="reference" [baseUrl]="BASE"
                    [value]="casosId()" (valueChange)="casosId.set($event)" />
                  <app-fk-combobox endpoint="/cases" displayField="title" [baseUrl]="BASE"
                    [value]="casosId()" (valueChange)="casosId.set($event)" />
                </div>
              }
            </div>
          </div>

        </div>

        <!-- ── Columna derecha: artículos ──────────────────────────────────── -->
        <div class="flex-1 flex flex-col min-h-0">

          @if (isView()) {
            <!-- ── Vista: artículos en préstamo + artículos a devolver ──── -->

            <!-- Artículos en préstamo (todas las líneas) -->
            <div class="flex-1 min-h-0 flex flex-col p-4 pb-2 overflow-hidden">
              <div class="shrink-0 flex items-center gap-2 mb-2">
                <ng-icon hlmIcon name="lucideListChecks" size="sm" class="text-[#005a3b] shrink-0" />
                <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Artículos en préstamo</span>
                <div class="flex-1 h-px bg-border"></div>
                <span class="text-xs tabular-nums text-[#005a3b] font-medium">{{ todasLineas().length }}</span>
              </div>
              <div class="flex-1 min-h-0 overflow-auto border-2 border-border rounded-md">
                @if (todasLineas().length === 0) {
                  <p class="px-4 py-6 text-xs text-muted-foreground text-center italic">Sin artículos registrados</p>
                } @else {
                  <table class="w-full text-xs border-collapse">
                    <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                        <th class="text-left font-normal px-3 py-1.5">Marca</th>
                        <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                        <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                        <th class="text-left font-normal px-3 py-1.5">Almacén</th>
                        <th class="text-left font-normal px-3 py-1.5 w-32">Dev. orden</th>
                        <th class="text-left font-normal px-3 py-1.5 w-24">Fecha dev.</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (p of todasLineas(); track p.id; let odd = $odd) {
                        @let inactiva = p.devuelta || aDevolverIds().has(p.id);
                        <tr class="border-b border-border/40 last:border-0 transition-colors"
                          [class.bg-surface-primary]="odd && !inactiva"
                          [class.bg-muted/30]="inactiva"
                          [class.cursor-pointer]="!inactiva"
                          [class.hover:bg-muted/50]="!inactiva"
                          (click)="selectParaDevolver(p)">
                          <td class="px-3 py-1.5 truncate" [class.text-[#005a3b]]="!inactiva" [class.text-muted-foreground]="inactiva">{{ p.tipoMaterialNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 truncate" [class.text-[#005a3b]]="!inactiva" [class.text-muted-foreground]="inactiva">{{ p.marcaNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 truncate" [class.text-[#005a3b]]="!inactiva" [class.text-muted-foreground]="inactiva">{{ p.modeloDescripcion ?? '—' }}</td>
                          <td class="px-3 py-1.5 font-mono truncate" [class.text-[#005a3b]]="!inactiva" [class.text-muted-foreground]="inactiva">{{ p.articuloSerialNumber ?? '—' }}</td>
                          <td class="px-3 py-1.5 truncate" [class.text-[#005a3b]]="!inactiva" [class.text-muted-foreground]="inactiva">{{ p.almacenNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 font-mono text-xs truncate text-muted-foreground">{{ p.ordenDevolucionReferencia ?? '' }}</td>
                          <td class="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">{{ p.fechaDevolucion ? (p.fechaDevolucion | slice:0:10) : '' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>

            @if (estadoOrdenNombre() !== 'Completada') {

            <div class="shrink-0 h-0.5 bg-[#005a3b] mx-4 my-1"></div>

            <!-- Artículos a devolver (selección) -->
            <div class="flex-1 min-h-0 flex flex-col p-4 pt-2 overflow-hidden">
              <div class="shrink-0 flex items-center gap-2 mb-2">
                <ng-icon hlmIcon name="lucideUndo2" size="sm" class="text-[#005a3b] shrink-0" />
                <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Artículos a devolver</span>
                <div class="flex-1 h-px bg-border"></div>
                @if (articulosADevolver().length > 0) {
                  <span class="text-xs tabular-nums text-[#005a3b] font-medium">{{ articulosADevolver().length }}</span>
                }
              </div>
              @if (devolucionError()) {
                <div class="shrink-0 rounded border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive mb-2">
                  {{ devolucionError() }}
                </div>
              }
              <div class="flex-1 min-h-0 overflow-auto border-2 border-border rounded-md">
                @if (articulosADevolver().length === 0) {
                  <p class="px-4 py-6 text-xs text-muted-foreground text-center italic">Haz clic en un artículo para añadirlo</p>
                } @else {
                  <table class="w-full text-xs border-collapse">
                    <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                        <th class="text-left font-normal px-3 py-1.5">Marca</th>
                        <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                        <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                        <th class="text-left font-normal px-3 py-1.5">Almacén</th>
                        <th class="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (a of articulosADevolverOrdenados(); track a.id; let odd = $odd) {
                        <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.tipoMaterialNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.marcaNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.modeloDescripcion ?? '—' }}</td>
                          <td class="px-3 py-1.5 font-mono text-[#005a3b] truncate">{{ a.articuloSerialNumber ?? '—' }}</td>
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.almacenNombre ?? '—' }}</td>
                          <td class="px-1 py-1.5">
                            <button hlmBtn variant="ghost" size="icon" class="size-6 text-muted-foreground hover:text-destructive"
                              (click)="quitarDeDevolucion(a)">
                              <ng-icon hlmIcon size="sm" name="lucideX" />
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>

            } <!-- /if estadoOrdenNombre !== Completada -->

          } @else {
            <!-- ── Alta: disponibles + seleccionados ──────────────────── -->
            <div class="flex-1 min-h-0 flex flex-col p-4 pb-2">
              <div class="shrink-0 flex items-center gap-2 mb-2">
                <ng-icon hlmIcon name="lucideBoxes" size="sm" class="text-[#005a3b] shrink-0" />
                <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Artículos disponibles</span>
                <div class="flex-1 h-px bg-border"></div>
              </div>
              @if (articulosError() && !isView()) {
                <p class="text-xs text-destructive mb-1">Debe añadir al menos un artículo.</p>
              }
              <div class="flex-1 min-h-0">
                @if (loadingArticulos()) {
                  <div class="flex items-center justify-center h-full"><hlm-spinner /></div>
                } @else {
                  <app-articulo-picker class="h-full"
                    [articulosDisponibles]="articulosDisponibles()"
                    [showSelected]="false"
                    [(value)]="articulosSeleccionados" />
                }
              </div>
            </div>

            <div class="shrink-0 h-0.5 bg-[#005a3b] mx-4 my-1"></div>

            <div class="flex-1 min-h-0 flex flex-col p-4 pt-2 overflow-hidden">
              <div class="shrink-0 flex items-center gap-2 mb-2">
                <ng-icon hlmIcon name="lucideListChecks" size="sm" class="text-[#005a3b] shrink-0" />
                <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide">Artículos seleccionados</span>
                <div class="flex-1 h-px bg-border"></div>
                @if (articulosSeleccionados().length > 0) {
                  <span class="text-xs tabular-nums text-[#005a3b] font-medium">{{ articulosSeleccionados().length }}</span>
                }
              </div>
              <div class="flex-1 min-h-0 overflow-auto border-2 border-border rounded-md">
                @if (articulosSeleccionados().length === 0) {
                  <p class="px-4 py-6 text-xs text-muted-foreground text-center italic">Haz clic en un artículo para añadirlo</p>
                } @else {
                  <table class="w-full text-xs border-collapse">
                    <thead class="sticky top-0 z-10 bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                        <th class="text-left font-normal px-3 py-1.5">Marca</th>
                        <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                        <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                        <th class="w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (a of articulosSeleccionadosOrdenados(); track a.id; let odd = $odd) {
                        <tr class="border-b border-border/40"
                          [class.last:border-0]="swapCandidateId() !== a.id"
                          [class.bg-surface-primary]="odd && swapCandidateId() !== a.id"
                          [class.bg-action/10]="swapCandidateId() === a.id">
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.tipoMaterialNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.brandName ?? '—' }}</td>
                          <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ a.modeloDescripcion ?? '—' }}</td>
                          <td class="px-3 py-1.5 font-mono text-[#005a3b] truncate">{{ a.serialNumber ?? '—' }}</td>
                          <td class="px-2 py-1.5">
                            <div class="flex items-center gap-1 justify-end">
                              <button
                                class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors"
                                [class.bg-[#005a3b]]="swapCandidateId() === a.id"
                                [class.text-white]="swapCandidateId() === a.id"
                                [class.bg-[#005a3b]/10]="swapCandidateId() !== a.id"
                                [class.text-[#005a3b]]="swapCandidateId() !== a.id"
                                [class.hover:bg-[#005a3b]/20]="swapCandidateId() !== a.id"
                                title="Cambiar número de serie"
                                (click)="toggleSwap(a.id)">
                                <ng-icon hlmIcon size="sm" name="lucideArrowLeftRight" />
                              </button>
                              <button
                                class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                title="Quitar"
                                (click)="removeArticulo(a.id)">
                                <ng-icon hlmIcon size="sm" name="lucideX" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        @if (swapCandidateId() === a.id) {
                          <tr class="border-b border-border/40 bg-action/5">
                            <td colspan="5" class="px-3 py-2">
                              @if (swapCandidates().length === 0) {
                                <p class="text-xs text-muted-foreground italic">Sin otros N.º de serie disponibles para este tipo/marca/modelo.</p>
                              } @else {
                                <p class="text-xs text-muted-foreground mb-1.5">Elige el nuevo N.º de serie:</p>
                                <div class="flex flex-wrap gap-1.5">
                                  @for (alt of swapCandidates(); track alt.id) {
                                    <button
                                      class="px-2.5 py-1 text-xs font-mono rounded border border-[#005a3b] text-[#005a3b] hover:bg-[#005a3b] hover:text-white transition-colors"
                                      (click)="swapArticulo(a.id, alt)">
                                      {{ alt.serialNumber ?? '(sin serie)' }}
                                    </button>
                                  }
                                </div>
                              }
                            </td>
                          </tr>
                        }
                      }
                    </tbody>
                  </table>
                }
              </div>
              @if (resumenPorTipo().length > 0) {
                <div class="shrink-0 mt-3 border-2 border-border rounded-md overflow-hidden">
                  <table class="w-full text-xs border-collapse">
                    <thead class="bg-[#005a3b] text-white">
                      <tr>
                        <th class="text-left font-normal px-3 py-1">Tipo</th>
                        <th class="text-right font-normal px-3 py-1 w-16">Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (r of resumenPorTipo(); track r.tipo; let odd = $odd) {
                        <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                          <td class="px-3 py-1 text-[#005a3b]">{{ r.tipo }}</td>
                          <td class="px-3 py-1 text-right tabular-nums text-[#005a3b] font-medium">{{ r.cantidad }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }

        </div>

      </div>

      <!-- Footer -->
      <div class="shrink-0 border-t border-border px-6 py-3 flex items-center gap-2 bg-background">
        <div class="flex-1"></div>
        @if (!isView()) {
          <button hlmBtn variant="destructive" size="sm" (click)="cancel()" [disabled]="saving()">
            Cancelar
          </button>
          <button hlmBtn size="sm" [disabled]="saving()" (click)="save()">
            @if (saving()) { <hlm-spinner class="mr-2" /> }
            Guardar orden
          </button>
        } @else {
          <button hlmBtn variant="destructive" size="sm" (click)="cancel()">
            Volver
          </button>
          @if (estadoOrdenNombre() === 'Pendiente') {
            <button hlmBtn size="sm"
              [disabled]="savingDevolucion() || articulosADevolver().length === 0"
              (click)="registrarDevolucion()">
              @if (savingDevolucion()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              @else { <ng-icon hlmIcon size="sm" name="lucideUndo2" class="mr-1" /> }
              Registrar devolución ({{ articulosADevolver().length }})
            </button>
          }
        }
      </div>

    <!-- Diálogo alta rápida de agente -->
    @if (showAgentDialog() && !isView()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (mousedown.self)="closeAgentDialog()">
        <div class="bg-background rounded-lg shadow-xl w-96 p-6 space-y-4">

          <div class="flex items-center gap-2">
            <ng-icon hlmIcon name="lucideUserPlus" size="sm" class="text-[#005a3b]" />
            <h3 class="text-sm font-medium text-[#005a3b] uppercase tracking-wide">Nuevo agente</h3>
          </div>

          @if (agentDialogError()) {
            <div class="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ agentDialogError() }}
            </div>
          }

          <div class="space-y-3">
            <div class="space-y-1">
              <label hlmLabel>Indicativo</label>
              <input hlmInput class="w-full" placeholder="Ej. ALFA-1" maxlength="20"
                [value]="newAgentCallSign()"
                (input)="newAgentCallSign.set($any($event.target).value)" />
            </div>
            <div class="space-y-1">
              <label hlmLabel>Nombre <span class="text-destructive">*</span></label>
              <input hlmInput class="w-full" placeholder="Nombre"
                [value]="newAgentFirstName()"
                (input)="newAgentFirstName.set($any($event.target).value)" />
            </div>
            <div class="space-y-1">
              <label hlmLabel>Apellidos</label>
              <input hlmInput class="w-full" placeholder="Apellidos"
                [value]="newAgentLastName()"
                (input)="newAgentLastName.set($any($event.target).value)" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="destructive" size="sm"
              [disabled]="savingAgent()" (click)="closeAgentDialog()">
              Cancelar
            </button>
            <button hlmBtn size="sm"
              [disabled]="savingAgent()" (click)="saveAgent()">
              @if (savingAgent()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta
            </button>
          </div>

        </div>
      </div>
    }

    </div>
  `,
})
export class LoanFormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly http   = inject(HttpClient);

  readonly BASE = BASE;

  readonly isView           = signal(false);
  readonly numeroReferencia = signal('');
  readonly estadoOrdenNombre = signal('');
  readonly headerLabel      = computed(() =>
    this.isView() ? `Orden ${this.numeroReferencia()}` : 'Nueva orden de préstamo'
  );

  readonly agenteOrigenId      = signal('');
  readonly unidadOrigenId      = signal('');
  readonly agenteDestinoId     = signal('');
  readonly unidadDestinoId     = signal('');
  readonly unidadOrigenNombre  = signal('');
  readonly agenteOrigenNombre  = signal('');
  readonly unidadDestinoNombre = signal('');
  readonly agenteDestinoNombre = signal('');
  readonly casosReference      = signal('');

  readonly agenteOrigenEndpoint  = computed(() =>
    this.unidadOrigenId()  ? `/catalog/agents?unitId=${this.unidadOrigenId()}`  : '/catalog/agents'
  );
  readonly agenteDestinoEndpoint = computed(() =>
    this.unidadDestinoId() ? `/catalog/agents?unitId=${this.unidadDestinoId()}` : '/catalog/agents'
  );
  readonly fechaInicio     = signal(new Date().toISOString().substring(0, 10));
  readonly fechaDevolucion = signal('');
  readonly casosId         = signal('');

  readonly articulosDisponibles   = signal<ArticuloMin[]>([]);
  readonly articulosSeleccionados = signal<ArticuloMin[]>([]);
  readonly todasLineas         = signal<LineaPrestamoDetalle[]>([]);
  readonly articulosADevolver  = signal<LineaPrestamoDetalle[]>([]);
  readonly aDevolverIds        = computed(() => new Set(this.articulosADevolver().map(a => a.id)));

  readonly swapCandidateId = signal<string | null>(null);
  readonly swapCandidates  = computed(() => {
    const id = this.swapCandidateId();
    if (!id) return [];
    const current = this.articulosSeleccionados().find(a => a.id === id);
    if (!current) return [];
    const selectedIds = new Set(this.articulosSeleccionados().map(a => a.id));
    return this.articulosDisponibles()
      .filter(a =>
        !selectedIds.has(a.id) &&
        a.tipoMaterialNombre === current.tipoMaterialNombre &&
        a.brandName          === current.brandName          &&
        a.modeloDescripcion  === current.modeloDescripcion
      )
      .sort((a, b) => (a.serialNumber ?? '').localeCompare(b.serialNumber ?? '', undefined, { sensitivity: 'base' }));
  });

  toggleSwap(id: string): void {
    this.swapCandidateId.set(this.swapCandidateId() === id ? null : id);
  }

  swapArticulo(currentId: string, newArticulo: ArticuloMin): void {
    this.articulosSeleccionados.update(list => list.map(a => a.id === currentId ? newArticulo : a));
    this.swapCandidateId.set(null);
  }

  private static cmpStr(x: string | null, y: string | null): number {
    return (x ?? '').localeCompare(y ?? '', undefined, { sensitivity: 'base' });
  }

  readonly articulosADevolverOrdenados = computed(() =>
    [...this.articulosADevolver()].sort((a, b) =>
      LoanFormComponent.cmpStr(a.tipoMaterialNombre, b.tipoMaterialNombre) ||
      LoanFormComponent.cmpStr(a.marcaNombre,        b.marcaNombre)        ||
      LoanFormComponent.cmpStr(a.modeloDescripcion,  b.modeloDescripcion)  ||
      LoanFormComponent.cmpStr(a.articuloSerialNumber, b.articuloSerialNumber)
    )
  );

  readonly articulosSeleccionadosOrdenados = computed(() =>
    [...this.articulosSeleccionados()].sort((a, b) =>
      LoanFormComponent.cmpStr(a.tipoMaterialNombre, b.tipoMaterialNombre) ||
      LoanFormComponent.cmpStr(a.brandName,          b.brandName)          ||
      LoanFormComponent.cmpStr(a.modeloDescripcion,  b.modeloDescripcion)  ||
      LoanFormComponent.cmpStr(a.serialNumber,       b.serialNumber)
    )
  );
  readonly savingDevolucion       = signal(false);
  readonly devolucionError        = signal<string | null>(null);
  readonly resumenPorTipo = computed(() => {
    const map = new Map<string, number>();
    for (const a of this.articulosSeleccionados()) {
      const tipo = a.tipoMaterialNombre ?? '—';
      map.set(tipo, (map.get(tipo) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([tipo, cantidad]) => ({ tipo, cantidad }));
  });
  readonly loadingArticulos       = signal(false);

  readonly saving           = signal(false);
  readonly saveError        = signal<string | null>(null);
  readonly origenError      = signal(false);
  readonly destinoError     = signal(false);
  readonly articulosError   = signal(false);
  readonly fechaInicioError = signal(false);

  readonly agentRefreshKey    = signal(0);
  readonly showAgentDialog    = signal<'origen' | 'destino' | null>(null);
  readonly newAgentCallSign   = signal('');
  readonly newAgentFirstName  = signal('');
  readonly newAgentLastName   = signal('');
  readonly savingAgent        = signal(false);
  readonly agentDialogError   = signal<string | null>(null);

  private agentDialogUnitId(): string {
    return this.showAgentDialog() === 'origen'
      ? this.unidadOrigenId()
      : this.unidadDestinoId();
  }

  constructor() {
    effect(() => { this.unidadOrigenId();  untracked(() => { if (!this.isView()) this.agenteOrigenId.set(''); }); });
    effect(() => { this.unidadDestinoId(); untracked(() => { if (!this.isView()) this.agenteDestinoId.set(''); }); });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isView.set(true);
      this.http.get<OrdenPrestamoDetail>(`${API_PRESTAMOS}/${id}`).subscribe({
        next: o => {
          this.numeroReferencia.set(o.numeroReferencia ?? '');
          this.estadoOrdenNombre.set(o.estadoOrdenNombre ?? '');
          this.unidadOrigenId.set(o.unidadOrigenId ?? '');
          this.unidadDestinoId.set(o.unidadDestinoId ?? '');
          this.agenteOrigenId.set(o.agenteOrigenId ?? '');
          this.agenteDestinoId.set(o.agenteDestinoId ?? '');
          this.unidadOrigenNombre.set(o.unidadOrigenNombre ?? '');
          this.agenteOrigenNombre.set(o.agenteOrigenNombre ?? '');
          this.unidadDestinoNombre.set(o.unidadDestinoNombre ?? '');
          this.agenteDestinoNombre.set(o.agenteDestinoNombre ?? '');
          this.casosReference.set(o.casosReference ?? '');
          this.fechaInicio.set(o.fechaInicio ? o.fechaInicio.substring(0, 10) : '');
          this.fechaDevolucion.set(o.fechaDevolucion ?? '');
          this.casosId.set(o.casosId ?? '');
        },
      });
      this.http.get<LineaPrestamoDetalle[]>(`${API_PRESTAMOS}/${id}/lineas-detalle`).subscribe({
        next: lineas => this.todasLineas.set(lineas),
      });
    } else {
      this.loadingArticulos.set(true);
      this.http.get<ArticuloMin[]>(API_ARTICULOS).subscribe({
        next:  data => { this.articulosDisponibles.set(data); this.loadingArticulos.set(false); },
        error: ()   => this.loadingArticulos.set(false),
      });
    }
  }

  save(): void {
    const hasOrigen      = !!this.unidadOrigenId();
    const hasDestino     = !!(this.unidadDestinoId() || this.agenteDestinoId());
    const hasArt         = this.articulosSeleccionados().length > 0;
    const hasFechaInicio = !!this.fechaInicio();
    this.origenError.set(!hasOrigen);
    this.destinoError.set(!hasDestino);
    this.articulosError.set(!hasArt);
    this.fechaInicioError.set(!hasFechaInicio);
    if (!hasOrigen || !hasDestino || !hasArt || !hasFechaInicio) return;

    this.saving.set(true);
    this.saveError.set(null);
    const body = {
      agenteOrigenId:  this.agenteOrigenId()  || null,
      unidadOrigenId:  this.unidadOrigenId()  || null,
      agenteDestinoId: this.agenteDestinoId() || null,
      unidadDestinoId: this.unidadDestinoId() || null,
      fechaInicio:     this.fechaInicio()     || null,
      fechaDevolucion: this.fechaDevolucion() || null,
      casosId:         this.casosId()         || null,
      articulosIds:    this.articulosSeleccionados().map(a => a.id),
    };
    this.http.post(API_PRESTAMOS, body).subscribe({
      next:  () => this.router.navigate(['/inventory/orders/loans']),
      error: () => { this.saveError.set('Error al guardar la orden de préstamo.'); this.saving.set(false); },
    });
  }

  openCreateAgent(side: 'origen' | 'destino'): void {
    this.newAgentCallSign.set('');
    this.newAgentFirstName.set('');
    this.newAgentLastName.set('');
    this.agentDialogError.set(null);
    this.showAgentDialog.set(side);
  }

  closeAgentDialog(): void { this.showAgentDialog.set(null); }

  saveAgent(): void {
    const firstName = this.newAgentFirstName().trim();
    if (!firstName) { this.agentDialogError.set('El nombre es obligatorio.'); return; }

    this.savingAgent.set(true);
    this.agentDialogError.set(null);

    const body = {
      callSign:  this.newAgentCallSign().trim() || null,
      firstName,
      lastName:  this.newAgentLastName().trim() || null,
      unitId:    this.agentDialogUnitId() || null,
      active:    true,
    };

    this.http.post<{ id: string }>(`${BASE}/catalog/agents`, body).subscribe({
      next: agent => {
        const side = this.showAgentDialog()!;
        this.agentRefreshKey.update(k => k + 1);
        if (side === 'origen') this.agenteOrigenId.set(agent.id);
        else                   this.agenteDestinoId.set(agent.id);
        this.savingAgent.set(false);
        this.showAgentDialog.set(null);
      },
      error: () => {
        this.agentDialogError.set('Error al crear el agente.');
        this.savingAgent.set(false);
      },
    });
  }

  removeArticulo(id: string): void {
    this.articulosSeleccionados.update(list => list.filter(a => a.id !== id));
  }

  cancel(): void { this.router.navigate(['/inventory/orders/loans']); }

  selectParaDevolver(item: LineaPrestamoDetalle): void {
    if (item.devuelta || this.aDevolverIds().has(item.id)) return;
    this.articulosADevolver.update(l => [...l, item]);
  }

  quitarDeDevolucion(item: LineaPrestamoDetalle): void {
    this.articulosADevolver.update(l => l.filter(a => a.id !== item.id));
  }

  registrarDevolucion(): void {
    const ids = this.articulosADevolver().map(a => a.id);
    if (ids.length === 0) return;
    const ordenId = this.route.snapshot.paramMap.get('id')!;
    this.savingDevolucion.set(true);
    this.devolucionError.set(null);
    this.http.post(`${BASE}/inventory/ordenes-devolucion`, {
      ordenPrestamoId: ordenId,
      lineaPrestamoIds: ids,
    }).subscribe({
      next:  () => this.router.navigate(['/inventory/orders/loans']),
      error: () => { this.devolucionError.set('Error al registrar la devolución.'); this.savingDevolucion.set(false); },
    });
  }
}
