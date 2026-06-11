import {
  ChangeDetectionStrategy, Component, OnInit,
  inject, signal, computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucideUndo2, lucidePackageCheck, lucideBuilding2,
  lucideUserCheck, lucideClipboard, lucidePackageOpen, lucideExternalLink,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { FormReadonlyDirective } from '../../../../shared/form/form-readonly.directive';
import { FormBase } from '../../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../../shared/form/spa-form-header.component';
import { SectionHeaderComponent } from '../../../../shared/components/historical-grid/section-header.component';
import { HistoricalGridComponent } from '../../../../shared/components/historical-grid/historical-grid.component';
import { FkComboboxComponent } from '../../../../shared/components/fk-combobox/fk-combobox.component';
import { AppTableService } from '../../../../core/services/app-table.service';
import { NotesComponent } from '../../../../shared/components/t300-notes/t300-notes.component';
import { DocumentsComponent } from '../../../../shared/components/t300-documents/t300-documents.component';

const BASE = 'http://localhost:8080/api/v1';

interface LineaDetalle {
  id: string;
  articuloSerialNumber: string | null;
  tipoMaterialNombre:   string | null;
  marcaNombre:          string | null;
  modeloDescripcion:    string | null;
  almacenNombre:        string | null;
  devuelta:                  boolean;
  ordenDevolucionId:         string | null;
  ordenDevolucionReferencia: string | null;
  fechaDevolucion:      string | null;
}

interface OrdenPrestamoInfo {
  numeroReferencia:    string;
  unidadOrigenId:      string | null;
  unidadOrigenNombre:  string | null;
  agenteOrigenId:      string | null;
  agenteOrigenNombre:  string | null;
  unidadDestinoId:     string | null;
  unidadDestinoNombre: string | null;
  agenteDestinoId:     string | null;
  agenteDestinoNombre: string | null;
  fechaInicio:         string | null;
  casosReference:      string | null;
  estadoOrdenNombre:   string | null;
}

@Component({
  selector: 'app-devolucion-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    HlmButtonImports, HlmIconImports, HlmInputImports,
    HlmLabelImports, HlmSpinnerImports,
    SpaFormHeaderComponent, FormReadonlyDirective,
    SectionHeaderComponent, HistoricalGridComponent, FkComboboxComponent,
    NotesComponent, DocumentsComponent,
  ],
  providers: [provideIcons({ lucideUndo2, lucidePackageCheck, lucideBuilding2, lucideUserCheck, lucideClipboard, lucidePackageOpen, lucideExternalLink })],
  template: `
    <div class="relative h-full flex flex-col min-h-0" [appFormReadonly]="formReadonly()">

      <app-spa-form-header
        [icon]="formIcon()"
        [readonly]="isView() ? true : false"
        [label]="headerLabel()"
        [backRoute]="backRoute()" />

      <div class="flex-1 min-h-0 flex overflow-hidden">

        <!-- ── Columna izquierda ────────────────────────────────────────────── -->
        <div class="w-[36rem] shrink-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-4">

          <!-- ── Caja 1: datos del préstamo (solo lectura) ──────────────── -->
          <div class="border border-[#005a3b]/40 rounded-lg overflow-hidden">
            <div class="bg-[#005a3b] text-white px-3 py-1.5 flex items-center gap-2">
              <ng-icon hlmIcon name="lucidePackageOpen" size="sm" />
              <span class="font-medium uppercase tracking-wide" style="font-size:10px">Orden de préstamo</span>
              <div class="flex-1"></div>
              <button hlmBtn variant="ghost" size="icon" class="size-6 text-white hover:bg-white/20"
                title="Ir al préstamo" (click)="goToPrestamo()">
                <ng-icon hlmIcon size="sm" name="lucideExternalLink" />
              </button>
            </div>
            <div class="p-4 space-y-4">

              <!-- Referencia -->
              <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
                <label hlmLabel class="whitespace-nowrap">Referencia</label>
                <input hlmInput readonly class="w-full font-mono" class="!text-foreground" style="background-color:#f0f0f0"
                  [value]="prestamo()?.numeroReferencia || '—'" />
              </div>

              <!-- Origen -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <ng-icon hlmIcon name="lucideBuilding2" size="sm" class="text-[#005a3b] shrink-0" />
                  <span class="font-medium text-[#005a3b] uppercase tracking-wide" style="font-size:10px">Origen</span>
                  <div class="flex-1 h-px bg-border"></div>
                </div>
                <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
                  <label hlmLabel class="whitespace-nowrap">Unidad</label>
                  <input hlmInput readonly class="w-full" class="!text-foreground" style="background-color:#f0f0f0"
                    [value]="prestamo()?.unidadOrigenNombre || '—'" />
                  <label hlmLabel class="whitespace-nowrap">Agente</label>
                  <input hlmInput readonly class="w-full !text-foreground" style="background-color:#f0f0f0"
                    [value]="prestamo()?.agenteOrigenNombre || '—'" />
                </div>
              </div>

              <!-- Destino -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <ng-icon hlmIcon name="lucideUserCheck" size="sm" class="text-[#005a3b] shrink-0" />
                  <span class="font-medium text-[#005a3b] uppercase tracking-wide" style="font-size:10px">Destino</span>
                  <div class="flex-1 h-px bg-border"></div>
                </div>
                <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
                  <label hlmLabel class="whitespace-nowrap">Unidad</label>
                  <input hlmInput readonly class="w-full" class="!text-foreground" style="background-color:#f0f0f0"
                    [value]="prestamo()?.unidadDestinoNombre || '—'" />
                  <label hlmLabel class="whitespace-nowrap">Agente</label>
                  <input hlmInput readonly class="w-full !text-foreground" style="background-color:#f0f0f0"
                    [value]="prestamo()?.agenteDestinoNombre || '—'" />
                </div>
              </div>

              <!-- Datos adicionales (sin fecha devolución) -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <ng-icon hlmIcon name="lucideClipboard" size="sm" class="text-[#005a3b] shrink-0" />
                  <span class="font-medium text-[#005a3b] uppercase tracking-wide" style="font-size:10px">Datos adicionales</span>
                  <div class="flex-1 h-px bg-border"></div>
                </div>
                <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
                  <label hlmLabel class="whitespace-nowrap">Inicio</label>
                  <input hlmInput type="date" readonly class="w-full" class="!text-foreground" style="background-color:#f0f0f0"
                    [value]="prestamo()?.fechaInicio?.substring(0, 10) ?? ''" />
                  <label hlmLabel class="whitespace-nowrap">Caso</label>
                  <input hlmInput readonly class="w-full" class="!text-foreground" style="background-color:#f0f0f0"
                    [value]="prestamo()?.casosReference || '—'" />
                </div>
              </div>

            </div>
          </div>

          <!-- ── Caja 2: datos de la devolución (editable, solo en alta) ── -->
          @if (!isView() && !loading()) {
            <div class="border border-[#005a3b]/40 rounded-lg overflow-hidden">
              <div class="bg-[#005a3b] text-white px-3 py-1.5 flex items-center gap-2">
                <ng-icon hlmIcon [name]="formIcon()" size="sm" />
                <span class="font-medium uppercase tracking-wide" style="font-size:10px">Datos de la devolución</span>
              </div>
              <div class="p-4 space-y-4">

                <!-- Quien devuelve (origen) -->
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon hlmIcon name="lucideBuilding2" size="sm" class="text-[#005a3b] shrink-0" />
                    <span class="font-medium text-[#005a3b] uppercase tracking-wide" style="font-size:10px">Quien devuelve</span>
                    <div class="flex-1 h-px bg-border"></div>
                  </div>
                  <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
                    <label hlmLabel class="pt-2 whitespace-nowrap">Unidad</label>
                    <app-fk-combobox endpoint="/catalog/units" placeholder="Unidad que devuelve"
                      [value]="unidadDevolucionId() ?? ''"
                      (valueChange)="unidadDevolucionId.set($event)"
                      (labelChange)="unidadDevolucionNombre.set($event)" />
                    <label hlmLabel class="pt-2 whitespace-nowrap">Agente</label>
                    <app-fk-combobox endpoint="/catalog/agents" placeholder="Agente que devuelve"
                      [value]="agenteDevolucionId() ?? ''"
                      (valueChange)="agenteDevolucionId.set($event)"
                      (labelChange)="agenteDevolucionNombre.set($event)" />
                  </div>
                </div>

                <!-- Quien recibe (destino) -->
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon hlmIcon name="lucideUserCheck" size="sm" class="text-[#005a3b] shrink-0" />
                    <span class="font-medium text-[#005a3b] uppercase tracking-wide" style="font-size:10px">Quien recibe</span>
                    <div class="flex-1 h-px bg-border"></div>
                  </div>
                  <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
                    <label hlmLabel class="pt-2 whitespace-nowrap">Unidad</label>
                    <app-fk-combobox endpoint="/catalog/units" placeholder="Unidad que recibe"
                      [value]="unidadDestinoDevId() ?? ''"
                      (valueChange)="unidadDestinoDevId.set($event)"
                      (labelChange)="unidadDestinoDevNombre.set($event)" />
                    <label hlmLabel class="pt-2 whitespace-nowrap">Agente</label>
                    <app-fk-combobox endpoint="/catalog/agents" placeholder="Agente que recibe"
                      [value]="agenteDestinoDevId() ?? ''"
                      (valueChange)="agenteDestinoDevId.set($event)"
                      (labelChange)="agenteDestinoDevNombre.set($event)" />
                  </div>
                </div>

                <!-- Fecha -->
                <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-start">
                  <label hlmLabel class="pt-2 whitespace-nowrap">Fecha</label>
                  <input hlmInput type="date" class="w-full"
                    [value]="fechaDevolucion()"
                    (change)="fechaDevolucion.set($any($event.target).value)" />
                </div>

              </div>
            </div>
          }

        </div>

        <!-- ── Columna derecha ────────────────────────────────────────────── -->
        <div class="flex-1 flex min-h-0 overflow-hidden">

          @if (loading()) {
            <div class="flex items-center justify-center flex-1"><hlm-spinner /></div>

          } @else if (isView()) {
            <!-- ── MODO VISUALIZACIÓN ───────────────────────────────────── -->
            <div class="flex-1 flex flex-col p-4 gap-2 overflow-auto">

              <!-- Artículos devueltos -->
              <app-section-header title="Artículos devueltos" icon="lucidePackageCheck" class="shrink-0" />
              <div class="shrink-0 flex flex-col" style="height:20rem">
                <app-historical-grid [empty]="lineasVista().length === 0" emptyMessage="Sin artículos devueltos">
                  <thead class="bg-[#005a3b] text-white sticky top-0 z-10">
                    <tr>
                      <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                      <th class="text-left font-normal px-3 py-1.5">Marca</th>
                      <th class="text-left font-normal px-3 py-1.5">Modelo</th>
                      <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                      <th class="text-left font-normal px-3 py-1.5">Almacén</th>
                      <th class="text-left font-normal px-3 py-1.5 w-28 whitespace-nowrap">Fecha dev.</th>
                      @if (!devolucionRef) {
                        <th class="text-left font-normal px-3 py-1.5 w-28 whitespace-nowrap">Orden dev.</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (l of lineasVista(); track l.id; let odd = $odd) {
                      <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                        <td class="px-3 py-1.5 truncate">{{ l.tipoMaterialNombre ?? '—' }}</td>
                        <td class="px-3 py-1.5 truncate">{{ l.marcaNombre ?? '—' }}</td>
                        <td class="px-3 py-1.5 truncate">{{ l.modeloDescripcion ?? '—' }}</td>
                        <td class="px-3 py-1.5 font-mono truncate">{{ l.articuloSerialNumber ?? '—' }}</td>
                        <td class="px-3 py-1.5 truncate">{{ l.almacenNombre ?? '—' }}</td>
                        <td class="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                          {{ l.fechaDevolucion ? (l.fechaDevolucion | date:'dd/MM/yy') : '' }}
                        </td>
                        @if (!devolucionRef) {
                          <td class="px-3 py-1.5 font-mono text-muted-foreground truncate">{{ l.ordenDevolucionReferencia ?? '' }}</td>
                        }
                      </tr>
                    }
                  </tbody>
                </app-historical-grid>
              </div>
              <p class="text-muted-foreground shrink-0" style="font-size:10px">
                {{ devueltas() }} artículo{{ devueltas() !== 1 ? 's' : '' }} devuelto{{ devueltas() !== 1 ? 's' : '' }}
                @if (!devolucionRef) { de {{ todasLineas().length }} en préstamo }
              </p>

              <!-- T300: notas y documentos -->
              <div class="flex gap-4 mt-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-1">Notas</p>
                  <app-t300-notes [recordId]="devolucionId()" [appTableId]="devolucionAppTableId()" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-1">Documentos</p>
                  <app-t300-documents [recordId]="devolucionId()" [appTableId]="devolucionAppTableId()" />
                </div>
              </div>

            </div>

          } @else {
            <!-- ── MODO ALTA: datos + artículos | previsualización ──────── -->

            <!-- Sub-columna izquierda: selección de artículos (flex-1) -->
            <div class="flex-1 min-w-0 flex flex-col overflow-y-auto border-r border-border p-4 space-y-4">

              <!-- Selección de artículos -->
              <div class="flex flex-col flex-1 min-h-0 gap-2">
                @if (saveError()) {
                  <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive shrink-0">
                    {{ saveError() }}
                  </div>
                }
                <app-section-header title="Artículos a devolver" [icon]="formIcon()" class="shrink-0">
                  @if (selected().size > 0) {
                    <span class="tabular-nums text-[#005a3b] font-medium shrink-0" style="font-size:10px">{{ selected().size }}/{{ lineasPendientes().length }}</span>
                  }
                </app-section-header>
                <!-- Rejilla artículos -->
                <div class="shrink-0 flex flex-col" style="height:20rem">
                  <app-historical-grid [empty]="lineasPendientes().length === 0" emptyMessage="Sin artículos pendientes de devolución">
                    <thead class="bg-[#005a3b] text-white sticky top-0 z-10">
                      <tr>
                        <th class="w-8 px-3 py-1.5">
                          <input type="checkbox" class="size-3.5 cursor-pointer accent-white"
                            [checked]="allSelected()"
                            (change)="toggleAll($any($event.target).checked)" />
                        </th>
                        <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                        <th class="text-left font-normal px-3 py-1.5">Marca / Modelo</th>
                        <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">N.º Serie</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (l of lineasPendientes(); track l.id) {
                        <tr class="border-b border-border/40 last:border-0 bg-amber-50 cursor-pointer"
                          (click)="toggleLine(l.id)">
                          <td class="px-3 py-1.5">
                            <input type="checkbox" class="size-3.5 cursor-pointer accent-[#005a3b]"
                              [checked]="selected().has(l.id)"
                              (click)="$event.stopPropagation()"
                              (change)="toggleLine(l.id)" />
                          </td>
                          <td class="px-3 py-1.5 truncate">{{ l.tipoMaterialNombre ?? '—' }}</td>
                          <td class="px-3 py-1.5 truncate">{{ l.marcaNombre ?? '' }}{{ l.modeloDescripcion ? ' / ' + l.modeloDescripcion : '' }}</td>
                          <td class="px-3 py-1.5 font-mono truncate">{{ l.articuloSerialNumber ?? '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </app-historical-grid>
                </div>

                <!-- T300: notas y documentos -->
                <div class="flex gap-4 mt-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-1">Notas</p>
                    <app-t300-notes [recordId]="devolucionId()" [appTableId]="devolucionAppTableId()" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-1">Documentos</p>
                    <app-t300-documents [recordId]="devolucionId()" [appTableId]="devolucionAppTableId()" />
                  </div>
                </div>
              </div>

            </div>

            <!-- Sub-columna derecha: previsualización del informe (ancho fijo, doc alineado a la derecha) -->
            <div class="w-[540px] shrink-0 overflow-auto p-4 bg-muted/20 flex flex-col items-end">
              <div class="w-full max-w-[500px] bg-white border border-border shadow-sm">

                <!-- Cabecera del documento -->
                <div class="bg-[#005a3b] text-white px-5 py-3">
                  <p class="font-semibold tracking-wide" style="font-size:12px">ORDEN DE DEVOLUCIÓN DE PRÉSTAMO</p>
                  <p class="opacity-75 mt-0.5" style="font-size:10px">Referencia préstamo: {{ prestamo()?.numeroReferencia ?? '—' }}</p>
                </div>
                <div class="border-b-4 border-[#f4c430]"></div>

                <div class="p-5 space-y-5" style="font-size:11px">

                  <!-- Datos del préstamo -->
                  <div>
                    <p class="font-semibold text-[#005a3b] pb-0.5 mb-2 border-b border-[#005a3b]/30 uppercase tracking-wide" style="font-size:10px">Datos del préstamo</p>
                    <table class="w-full border-collapse">
                      <tr><td class="text-muted-foreground w-32 py-0.5 align-top">Unidad emisora</td><td class="py-0.5">{{ prestamo()?.unidadOrigenNombre ?? '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5 align-top pl-3">└ Agente</td><td class="py-0.5">{{ prestamo()?.agenteOrigenNombre ?? '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5 align-top">Unidad receptora</td><td class="py-0.5">{{ prestamo()?.unidadDestinoNombre ?? '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5 align-top pl-3">└ Agente</td><td class="py-0.5">{{ prestamo()?.agenteDestinoNombre ?? '—' }}</td></tr>
                      @if (prestamo()?.casosReference) {
                        <tr><td class="text-muted-foreground py-0.5">Expediente</td><td class="py-0.5 font-mono">{{ prestamo()!.casosReference }}</td></tr>
                      }
                    </table>
                  </div>

                  <!-- Datos de la devolución -->
                  <div>
                    <p class="font-semibold text-[#005a3b] pb-0.5 mb-2 border-b border-[#005a3b]/30 uppercase tracking-wide" style="font-size:10px">Datos de la devolución</p>
                    <table class="w-full border-collapse">
                      <tr><td class="text-muted-foreground w-32 py-0.5 font-medium" colspan="2" style="font-size:9px">QUIEN DEVUELVE</td></tr>
                      <tr><td class="text-muted-foreground w-32 py-0.5 pl-2">Unidad</td><td class="py-0.5">{{ unidadDevolucionNombre() || '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5 pl-4">└ Agente</td><td class="py-0.5">{{ agenteDevolucionNombre() || '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5 font-medium pt-2" colspan="2" style="font-size:9px">QUIEN RECIBE</td></tr>
                      <tr><td class="text-muted-foreground w-32 py-0.5 pl-2">Unidad</td><td class="py-0.5">{{ unidadDestinoDevNombre() || '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5 pl-4">└ Agente</td><td class="py-0.5">{{ agenteDestinoDevNombre() || '—' }}</td></tr>
                      <tr><td class="text-muted-foreground py-0.5">Fecha</td><td class="py-0.5">{{ formatDate(fechaDevolucion()) }}</td></tr>
                    </table>
                  </div>

                  <!-- Artículos -->
                  <div>
                    <p class="font-semibold text-[#005a3b] pb-0.5 mb-2 border-b border-[#005a3b]/30 uppercase tracking-wide" style="font-size:10px">
                      Artículos a devolver ({{ articulosSeleccionados().length }})
                    </p>
                    @if (articulosSeleccionados().length === 0) {
                      <p class="text-muted-foreground italic py-2">Sin artículos seleccionados</p>
                    } @else {
                      <table class="w-full border-collapse">
                        <thead>
                          <tr class="border-b border-border">
                            <th class="text-left font-medium text-muted-foreground py-1 pr-2 w-6">#</th>
                            <th class="text-left font-medium text-muted-foreground py-1 pr-2">Tipo / Marca</th>
                            <th class="text-left font-medium text-muted-foreground py-1">N.º Serie</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (a of articulosSeleccionados(); track a.id; let i = $index; let odd = $odd) {
                            <tr class="border-b border-border/30 last:border-0" [class.bg-gray-50]="odd">
                              <td class="py-0.5 pr-2 text-muted-foreground">{{ i + 1 }}</td>
                              <td class="py-0.5 pr-2">{{ a.tipoMaterialNombre ?? '—' }}{{ a.marcaNombre ? ' · ' + a.marcaNombre : '' }}</td>
                              <td class="py-0.5 font-mono">{{ a.articuloSerialNumber ?? '—' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>

                  <!-- Firmas -->
                  <div class="grid grid-cols-2 gap-8 pt-6">
                    <div class="text-center">
                      <div class="border-b border-foreground mb-1 mt-10"></div>
                      <p class="text-muted-foreground" style="font-size:10px">Quien devuelve</p>
                      <p class="font-medium mt-0.5">{{ agenteDevolucionNombre() || '___________________' }}</p>
                    </div>
                    <div class="text-center">
                      <div class="border-b border-foreground mb-1 mt-10"></div>
                      <p class="text-muted-foreground" style="font-size:10px">Quien recibe</p>
                      <p class="font-medium mt-0.5">{{ agenteDestinoDevNombre() || '___________________' }}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          }

        </div>
      </div>

      <!-- Footer -->
      @if (!isView()) {
        <div class="shrink-0 border-t border-border px-6 py-3 flex items-center gap-2 bg-background">
          <div class="flex-1"></div>
          <button hlmBtn variant="outline" class="h-8 shrink-0 text-red-600 border-red-400 hover:bg-red-50" size="sm"
            (click)="showConfirmCancel.set(true)" [disabled]="saving()">
            Cancelar
          </button>
          <button hlmBtn size="sm"
            [disabled]="saving() || selected().size === 0" (click)="showConfirmSave.set(true)">
            @if (saving()) { <hlm-spinner class="mr-2 size-3.5" /> }
            @else { <ng-icon hlmIcon size="sm" [name]="formIcon()" class="mr-1" /> }
            Confirmar devolución ({{ selected().size }})
          </button>
        </div>
      }

      <!-- Diálogo: confirmar cancelar -->
      @if (showConfirmCancel()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-background rounded-lg border border-border shadow-xl p-6 w-80 space-y-4">
            <h3 class="font-semibold text-foreground">¿Cancelar devolución?</h3>
            <p class="text-muted-foreground">Se perderán los datos introducidos y volverás a la orden de préstamo.</p>
            <div class="flex justify-end gap-2">
              <button hlmBtn variant="outline" size="sm" class="h-7" (click)="showConfirmCancel.set(false)">Volver</button>
              <button hlmBtn variant="destructive" size="sm" class="h-7" (click)="cancel()">Sí, cancelar</button>
            </div>
          </div>
        </div>
      }

      <!-- Diálogo: confirmar guardar -->
      @if (showConfirmSave()) {
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-background rounded-lg border border-border shadow-xl p-6 w-80 space-y-4">
            <h3 class="font-semibold text-foreground">¿Confirmar devolución?</h3>
            <p class="text-muted-foreground">Se registrará la devolución de <strong>{{ selected().size }}</strong> artículo{{ selected().size !== 1 ? 's' : '' }}. Esta acción no se puede deshacer.</p>
            <div class="flex justify-end gap-2">
              <button hlmBtn variant="outline" size="sm" class="h-7" (click)="showConfirmSave.set(false)">Volver</button>
              <button hlmBtn size="sm" class="h-7" (click)="showConfirmSave.set(false); save()">
                <ng-icon hlmIcon size="sm" [name]="formIcon()" class="mr-1" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      }

    </div>


  `,
})
export class DevolucionFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName = 't600_ordenes_devolucion';
  protected override readonly icon             = 'lucidePackageCheck';
  protected override readonly labelSingular    = 'Devolución de préstamo';
  override entityDescription(): string { return this.prestamo()?.numeroReferencia ?? ''; }

  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly http        = inject(HttpClient);
  private readonly appTableSvc = inject(AppTableService);

  private ordenPrestamoId = '';
  devolucionRef = '';   // ref de la orden de devolución específica (si se viene desde la rejilla)

  override readonly loading   = signal(true);
  override readonly saving    = signal(false);
  override readonly saveError = signal<string | null>(null);
  readonly prestamo  = signal<OrdenPrestamoInfo | null>(null);

  /** Todas las líneas del préstamo (con estado de devolución) */
  readonly todasLineas = signal<LineaDetalle[]>([]);

  /**
   * Líneas visibles en modo visualización:
   * - Si venimos de una devolución específica (devRef param): solo las de esa devolución
   * - Si no: todas las devueltas
   */
  readonly lineasVista = computed(() => {
    const lineas = this.todasLineas();
    if (this.devolucionRef) {
      return lineas.filter(l => l.ordenDevolucionReferencia === this.devolucionRef);
    }
    return lineas.filter(l => l.devuelta);
  });

  /** Solo las líneas pendientes de devolver */
  readonly lineasPendientes = computed(() =>
    [...this.todasLineas()]
      .filter(l => !l.devuelta)
      .sort((a, b) => {
        const cmp = (x: string | null, y: string | null) =>
          (x ?? '').localeCompare(y ?? '', undefined, { sensitivity: 'base' });
        return cmp(a.tipoMaterialNombre, b.tipoMaterialNombre)
            || cmp(a.marcaNombre, b.marcaNombre)
            || cmp(a.modeloDescripcion, b.modeloDescripcion)
            || cmp(a.articuloSerialNumber, b.articuloSerialNumber);
      })
  );

  readonly devueltas = computed(() => this.lineasVista().length);

  /**
   * Modo visualización:
   * - Si venimos de una devolución específica: siempre vista
   * - Si no: cuando no hay pendientes
   */
  readonly isView = computed(() =>
    !this.loading() && (!!this.devolucionRef || this.lineasPendientes().length === 0)
  );

  readonly selected               = signal<Set<string>>(new Set());
  readonly showConfirmCancel      = signal(false);
  readonly showConfirmSave        = signal(false);
  // Origen (quien devuelve) — defaults to loan's destino
  readonly unidadDevolucionId     = signal<string | null>(null);
  readonly agenteDevolucionId     = signal<string | null>(null);
  readonly unidadDevolucionNombre = signal<string>('');
  readonly agenteDevolucionNombre = signal<string>('');
  // Destino (quien recibe) — defaults to loan's origen
  readonly unidadDestinoDevId     = signal<string | null>(null);
  readonly agenteDestinoDevId     = signal<string | null>(null);
  readonly unidadDestinoDevNombre = signal<string>('');
  readonly agenteDestinoDevNombre = signal<string>('');
  readonly fechaDevolucion        = signal<string>(new Date().toISOString().substring(0, 10));

  readonly articulosSeleccionados = computed(() =>
    this.lineasPendientes().filter(l => this.selected().has(l.id))
  );

  // ── T300 tab panel ────────────────────────────────────────────────────────
  readonly devolucionAppTableId = signal<string | null>(null);
  readonly devolucionId         = signal<string | null>(null);

  readonly headerLabel = computed(() => {
    const ref = this.prestamo()?.numeroReferencia;
    return ref ? `Devolución — ${ref}` : 'Devolución de préstamo';
  });

  readonly backRoute = computed(() =>
    `/inventory/orders/loans/${this.ordenPrestamoId}`
  );

  readonly allSelected = computed(() =>
    this.lineasPendientes().length > 0 &&
    this.selected().size === this.lineasPendientes().length
  );

  ngOnInit(): void {
    this.loadFormMeta();
    this.ordenPrestamoId = this.route.snapshot.paramMap.get('id') ?? '';
    this.devolucionRef   = this.route.snapshot.queryParamMap.get('devRef') ?? '';

    this.http.get<OrdenPrestamoInfo>(`${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}`)
      .subscribe({ next: o => {
        this.prestamo.set(o);
        // Origen (quien devuelve) = destino del préstamo
        if (o.unidadDestinoId)      this.unidadDevolucionId.set(o.unidadDestinoId);
        if (o.agenteDestinoId)      this.agenteDevolucionId.set(o.agenteDestinoId);
        if (o.unidadDestinoNombre)  this.unidadDevolucionNombre.set(o.unidadDestinoNombre);
        if (o.agenteDestinoNombre)  this.agenteDevolucionNombre.set(o.agenteDestinoNombre);
        // Destino (quien recibe) = origen del préstamo
        if (o.unidadOrigenId)       this.unidadDestinoDevId.set(o.unidadOrigenId);
        if (o.agenteOrigenId)       this.agenteDestinoDevId.set(o.agenteOrigenId);
        if (o.unidadOrigenNombre)   this.unidadDestinoDevNombre.set(o.unidadOrigenNombre);
        if (o.agenteOrigenNombre)   this.agenteDestinoDevNombre.set(o.agenteOrigenNombre);
      }});

    const preselectedIds: string[] | null = history.state?.preselectedIds ?? null;

    this.appTableSvc.getByTableName('t600_ordenes_devolucion').subscribe({
      next: table => this.devolucionAppTableId.set(table.id),
    });

    this.http.get<LineaDetalle[]>(
      `${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}/lineas-detalle`
    ).subscribe({
      next: lineas => {
        this.todasLineas.set(lineas);
        const pending = lineas.filter(l => !l.devuelta);
        const toSelect = preselectedIds
          ? pending.filter(l => preselectedIds.includes(l.id))
          : pending;
        this.selected.set(new Set(toSelect.map(l => l.id)));
        this.loading.set(false);
        if (this.devolucionRef) {
          const match = lineas.find(l => l.ordenDevolucionReferencia === this.devolucionRef && l.ordenDevolucionId);
          if (match?.ordenDevolucionId) {
            this.devolucionId.set(match.ordenDevolucionId);
          }
        }
      },
      error: () => this.loading.set(false),
    });
  }

  toggleLine(id: string): void {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  toggleAll(checked: boolean): void {
    this.selected.set(
      checked ? new Set(this.lineasPendientes().map(l => l.id)) : new Set()
    );
  }

  save(): void {
    if (this.selected().size === 0) return;
    this.saving.set(true);
    this.saveError.set(null);

    this.http.post<{ id: string; numeroReferencia: string }>(`${BASE}/inventory/ordenes-devolucion`, {
      ordenPrestamoId:  this.ordenPrestamoId,
      lineaPrestamoIds: [...this.selected()],
      agenteOrigenId:   this.agenteDevolucionId()   ?? null,
      unidadOrigenId:   this.unidadDevolucionId()   ?? null,
      agenteDestinoId:  this.agenteDestinoDevId()   ?? null,
      unidadDestinoId:  this.unidadDestinoDevId()   ?? null,
      fechaDevolucion:  this.fechaDevolucion()       || null,
    }).subscribe({
      next: res => {
        this.devolucionRef = res.numeroReferencia;
        this.devolucionId.set(res.id);
        this.http.get<LineaDetalle[]>(
          `${BASE}/inventory/ordenes-prestamo/${this.ordenPrestamoId}/lineas-detalle`
        ).subscribe({ next: lineas => { this.todasLineas.set(lineas); this.saving.set(false); } });
      },
      error: () => {
        this.saveError.set('Error al registrar la devolución.');
        this.saving.set(false);
      },
    });
  }

  goToPrestamo(): void {
    this.router.navigate(['/inventory/orders/loans', this.ordenPrestamoId]);
  }

  cancel(): void {
    this.router.navigate(['/inventory/orders/loans', this.ordenPrestamoId]);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
