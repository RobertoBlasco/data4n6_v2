import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideTrash2, lucideSave, lucideUserCheck, lucideIdCard,
  lucideImage, lucidePenLine, lucideFileText, lucideStickyNote, lucideImages,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { ApiService } from '../../../core/services/api.service';
import { AppTableService } from '../../../core/services/app-table.service';
import { FkComboboxComponent } from '../../../shared/components/fk-combobox/fk-combobox.component';
import { FormBase } from '../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../shared/form/spa-form-header.component';
import { DeleteConfirmDialogComponent } from '../../../shared/form/delete-confirm-dialog.component';
import { HistoricalGridComponent } from '../../../shared/components/historical-grid/historical-grid.component';
import { SectionHeaderComponent } from '../../../shared/components/historical-grid/section-header.component';
import { SpaFormFooterComponent } from '../../../shared/form/spa-form-footer.component';
import { PicturePanelComponent, PictureItem } from '../../../shared/components/picture-panel/picture-panel.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

interface FotoResponse {
  id:              string;
  pictureTypeId:   string | null;
  pictureTypeName: string | null;
  esPrincipal:     boolean;
  filename:        string;
  filePath:        string;
  caption:         string | null;
  createdAt:       string;
}

interface NotaResponse {
  id:        string;
  body:      string;
  createdAt: string;
}

interface IdentDocResponse {
  id:           string;
  docTypeId:    string | null;
  docTypeName:  string | null;
  numero:       string;
  fechaCaducidad: string | null;
  createdAt:    string;
}

interface DocumentoResponse {
  id: string;
  documentTypeId:   string | null;
  documentTypeName: string | null;
  filename:         string;
  description:      string | null;
  createdAt:        string;
}

interface AgentResponse {
  id: string;
  callSign: string | null;
  firstName: string;
  lastName: string | null;
  unitId: string | null;
  unitName: string | null;
  active: boolean;
}

interface AgentRequest {
  callSign: string | null;
  firstName: string;
  lastName: string | null;
  unitId: string | null;
  active: boolean;
}

@Component({
  selector: 'app-agent-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    HlmButtonImports, HlmInputImports, HlmLabelImports, // HlmLabelImports still needed for checkbox labels
    HlmSpinnerImports, HlmIconImports,
    FkComboboxComponent,
    SpaFormHeaderComponent,
    DeleteConfirmDialogComponent,
    HistoricalGridComponent, SectionHeaderComponent, PicturePanelComponent, FormFieldComponent,
    SpaFormFooterComponent,
  ],
  providers: [provideIcons({ lucideTrash2, lucideSave, lucideUserCheck, lucideIdCard, lucideImage, lucidePenLine, lucideFileText, lucideStickyNote, lucideImages })],
  template: `
    <div class="h-full flex flex-col min-h-0 overflow-hidden">

      <app-spa-form-header
        [icon]="icon" [label]="labelSingular" [description]="entityDescription()"
        backRoute="/common/admin/t100_agents"
        [showMenu]="isEdit()">
        <button menu class="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
          (click)="exportarFicha()">
          Exportar ficha
        </button>
      </app-spa-form-header>

      <!-- ── Zona superior: imágenes + campos ─────────────────────────────── -->
      <div class="shrink-0 flex h-[22rem]">

        <!-- Fotos + Firma -->
        @if (isEdit()) {
          <div class="w-[15rem] shrink-0 p-4 border-r border-border self-stretch">
            <app-picture-panel
              title="Fotos" icon="lucideImage"
              [appTableId]="agentAppTableId ?? ''"
              [recordId]="agentId ?? ''"
              [pictureTypeId]="PORTRAIT_TYPE_ID"
              [pictures]="fotosGenerales()" [loading]="loadingFotos()"
              (delete)="onDeleteFoto($event)"
              (setPrincipal)="onSetPrincipal($event)"
              (pictureAdded)="onPictureAdded($event)" />
          </div>
          <div class="w-[15rem] shrink-0 p-4 border-r border-border self-stretch">
            <app-picture-panel
              title="Firma" icon="lucidePenLine"
              [appTableId]="agentAppTableId ?? ''"
              [recordId]="agentId ?? ''"
              [pictureTypeId]="SIGNATURE_TYPE_ID"
              [pictures]="firmas()" [loading]="loadingFotos()"
              (delete)="onDeleteFoto($event)"
              (setPrincipal)="onSetPrincipal($event)"
              (pictureAdded)="onPictureAdded($event)" />
          </div>
        }

        <!-- Campos del formulario -->
        <div class="flex-1 p-5 space-y-4 border-r border-border overflow-hidden">
          @if (loading()) {
            <div class="flex items-center justify-center py-10"><hlm-spinner /></div>
          }
          @if (loadError() && !loading()) {
            <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {{ loadError() }}
            </div>
          }
          @if (!loading() && !loadError()) {
            @if (saveError()) {
              <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {{ saveError() }}
              </div>
            }
            @if (savedOk()) {
              <div class="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                Cambios guardados correctamente.
              </div>
            }
            <div class="flex items-end gap-4">
              <app-form-field label="Indicativo">
                <input hlmInput class="w-28" placeholder="Ej. ALFA-1" maxlength="10"
                  [ngModel]="callSign()" (ngModelChange)="callSign.set($event); savedOk.set(false)" />
              </app-form-field>
              <div class="flex items-center gap-2 pb-1">
                <input type="checkbox" id="active"
                  class="size-4 rounded border-input accent-primary cursor-pointer"
                  [checked]="active()"
                  (change)="active.set($any($event.target).checked); savedOk.set(false)" />
                <label hlmLabel for="active" class="cursor-pointer">Activo</label>
              </div>
            </div>
            <app-form-field label="Nombre" [required]="true">
              <input hlmInput class="w-1/3" placeholder="Nombre" maxlength="100"
                [ngModel]="firstName()" (ngModelChange)="firstName.set($event); savedOk.set(false)" />
            </app-form-field>
            <app-form-field label="Apellidos">
              <input hlmInput class="w-1/3" placeholder="Apellidos" maxlength="100"
                [ngModel]="lastName()" (ngModelChange)="lastName.set($event); savedOk.set(false)" />
            </app-form-field>
            <app-form-field label="Unidad" [required]="true">
              <app-fk-combobox class="w-1/3" endpoint="/api/v1/catalog/units"
                [value]="unitId()" [displayHint]="unitName()"
                (valueChange)="unitId.set($event); unitName.set(''); savedOk.set(false)" />
            </app-form-field>
          }
        </div>

        <!-- Documentos de identificación -->
        @if (isEdit()) {
          <div class="w-[40rem] shrink-0 p-4 space-y-2 self-stretch">
            <app-section-header title="Documentos de identificación" icon="lucideIdCard"
              [showAdd]="true" (add)="openIdentDocDialog()" />
            <app-historical-grid
              [loading]="loadingIdentDocs()" [empty]="identDocs().length === 0"
              emptyMessage="Sin documentos registrados">
              <thead class="bg-[#005a3b] text-white">
                <tr>
                  <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                  <th class="text-left font-normal px-3 py-1.5">Número</th>
                  <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap">Caducidad</th>
                </tr>
              </thead>
              <tbody>
                @for (d of identDocs(); track d.id; let odd = $odd) {
                  <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                    <td class="px-3 py-1.5 text-[#005a3b]">{{ d.docTypeName ?? '—' }}</td>
                    <td class="px-3 py-1.5 font-mono text-[#005a3b]">{{ d.numero }}</td>
                    <td class="px-3 py-1.5 text-[#005a3b] whitespace-nowrap">{{ d.fechaCaducidad ? formatDate(d.fechaCaducidad) : '—' }}</td>
                  </tr>
                }
              </tbody>
            </app-historical-grid>
          </div>
        }

      </div>

      <!-- ── Separador verde ───────────────────────────────────────────────── -->
      <div class="shrink-0 h-0.5 bg-[#005a3b] mx-0 my-3"></div>

      <!-- ── Zona inferior: tab panel histórico ────────────────────────────── -->
      @if (isEdit()) {
        <div class="flex-1 flex flex-col min-h-0">

          <!-- Tab bar -->
          <div class="shrink-0 flex items-center gap-1 px-3 py-2 bg-muted/30 border-b border-border">
            @for (tab of tabs(); track tab.id) {
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                [class.bg-[#005a3b]]="activeTab() === tab.id"
                [class.text-white]="activeTab() === tab.id"
                [class.text-muted-foreground]="activeTab() !== tab.id"
                [class.hover:bg-muted]="activeTab() !== tab.id"
                (click)="activeTab.set(tab.id)">
                <ng-icon hlmIcon [name]="tab.icon" size="sm" />
                {{ tab.label }}
                <span class="min-w-[1.25rem] text-center px-1 rounded text-[10px] leading-4 tabular-nums"
                  [class.bg-white/25]="activeTab() === tab.id"
                  [class.text-white]="activeTab() === tab.id"
                  [class.bg-black/10]="activeTab() !== tab.id"
                  [class.text-muted-foreground]="activeTab() !== tab.id">
                  {{ tab.count }}
                </span>
              </button>
            }
          </div>

          <!-- Tab content -->
          <div class="flex-1 overflow-auto p-4 bg-muted/10">
            @if (activeTab() === 'documentos') {
              <app-historical-grid
                [loading]="loadingDocs()" [empty]="documentos().length === 0"
                emptyMessage="Sin documentos registrados">
                <thead class="bg-[#005a3b] text-white">
                  <tr>
                    <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                    <th class="text-left font-normal px-3 py-1.5">Fichero</th>
                    <th class="text-left font-normal px-3 py-1.5">Descripción</th>
                    <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap w-28">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  @for (d of documentos(); track d.id; let odd = $odd) {
                    <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                      <td class="px-3 py-1.5 text-[#005a3b]">{{ d.documentTypeName ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate max-w-[12rem]">{{ d.filename }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ d.description ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] whitespace-nowrap">{{ formatDate(d.createdAt) }}</td>
                    </tr>
                  }
                </tbody>
              </app-historical-grid>
            }
            @if (activeTab() === 'notas') {
              <app-historical-grid
                [loading]="loadingNotas()" [empty]="notas().length === 0"
                emptyMessage="Sin notas registradas">
                <thead class="bg-[#005a3b] text-white">
                  <tr>
                    <th class="text-left font-normal px-3 py-1.5">Nota</th>
                    <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap w-28">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  @for (n of notas(); track n.id; let odd = $odd) {
                    <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                      <td class="px-3 py-1.5 text-[#005a3b]" [innerHTML]="n.body"></td>
                      <td class="px-3 py-1.5 text-[#005a3b] whitespace-nowrap">{{ formatDate(n.createdAt) }}</td>
                    </tr>
                  }
                </tbody>
              </app-historical-grid>
            }
            @if (activeTab() === 'pictures') {
              <app-historical-grid
                [loading]="loadingFotos()" [empty]="fotos().length === 0"
                emptyMessage="Sin imágenes registradas">
                <thead class="bg-[#005a3b] text-white">
                  <tr>
                    <th class="text-left font-normal px-3 py-1.5">Tipo</th>
                    <th class="text-left font-normal px-3 py-1.5">Fichero</th>
                    <th class="text-left font-normal px-3 py-1.5">Caption</th>
                    <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap w-28">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  @for (f of fotos(); track f.id; let odd = $odd) {
                    <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
                      <td class="px-3 py-1.5 text-[#005a3b]">{{ f.pictureTypeName ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate max-w-[12rem]">{{ f.filename }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] truncate">{{ f.caption ?? '—' }}</td>
                      <td class="px-3 py-1.5 text-[#005a3b] whitespace-nowrap">{{ formatDate(f.createdAt) }}</td>
                    </tr>
                  }
                </tbody>
              </app-historical-grid>
            }
          </div>

        </div>
      }

      <app-spa-form-footer>
        @if (isEdit()) {
          <button hlmBtn variant="destructive" size="sm" class="h-7"
            [disabled]="loading() || saving()" (click)="openDelete()">
            <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" /> Eliminar
          </button>
        }
        <button hlmBtn size="sm" class="h-7"
          [disabled]="loading() || saving()" (click)="save()">
          @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
          @else { <ng-icon hlmIcon size="sm" name="lucideSave" class="mr-1" /> }
          Guardar
        </button>
      </app-spa-form-footer>

    </div>

    @if (showIdentDocDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (mousedown.self)="closeIdentDocDialog()">
        <div class="bg-background rounded-lg shadow-xl w-96 p-6 space-y-4">

          <div class="flex items-center gap-2">
            <ng-icon hlmIcon name="lucideIdCard" size="sm" class="text-[#005a3b]" />
            <h3 class="text-sm font-medium text-[#005a3b] uppercase tracking-wide">Nuevo documento</h3>
          </div>

          @if (identDocError()) {
            <div class="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ identDocError() }}
            </div>
          }

          <div class="space-y-3">
            <div class="space-y-1">
              <label hlmLabel>Tipo</label>
              <app-fk-combobox class="w-full" endpoint="/catalog/docs" displayField="description"
                [value]="newDocTypeId()"
                (valueChange)="newDocTypeId.set($event)" />
            </div>
            <div class="space-y-1">
              <label hlmLabel>Número <span class="text-destructive">*</span></label>
              <input hlmInput class="w-full" placeholder="Ej. 12345678A" maxlength="100"
                [value]="newNumero()"
                (input)="newNumero.set($any($event.target).value)" />
            </div>
            <div class="space-y-1">
              <label hlmLabel>Fecha caducidad</label>
              <input hlmInput type="date" class="w-44"
                [value]="newFechaCaducidad()"
                (change)="newFechaCaducidad.set($any($event.target).value)" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="destructive" size="sm"
              [disabled]="savingIdentDoc()" (click)="closeIdentDocDialog()">
              Cancelar
            </button>
            <button hlmBtn size="sm"
              [disabled]="savingIdentDoc()" (click)="saveIdentDoc()">
              @if (savingIdentDoc()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta
            </button>
          </div>

        </div>
      </div>
    }

    <app-delete-confirm-dialog
      [icon]="icon" [label]="labelSingular" [description]="entityDescription()"
      [state]="deleteState()" (stateChanged)="onDeleteStateChanged($event)"
      (confirmed)="confirmDelete()" />
  `,
})
export class AgentFormComponent extends FormBase implements OnInit {
  readonly PORTRAIT_TYPE_ID  = 'b1000000-0000-0000-0000-000000000002';
  readonly SIGNATURE_TYPE_ID = 'b1000000-0000-0000-0000-000000000001';
  protected override readonly icon          = 'lucideUserCheck';
  protected override readonly labelSingular = 'Agente';
  override entityDescription(): string {
    const first = this.firstName().trim();
    const last  = this.lastName().trim();
    if (!first && !last) return 'Nuevo agente';
    return [last, first].filter(Boolean).join(', ');
  }

  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly api         = inject(ApiService);
  private readonly appTableSvc = inject(AppTableService);

  readonly isEdit   = signal(false);
  protected agentId: string | null = null;

  readonly callSign  = signal('');
  readonly firstName = signal('');
  readonly lastName  = signal('');
  readonly unitId    = signal('');
  readonly unitName  = signal('');
  readonly active    = signal(true);

  readonly fotos         = signal<PictureItem[]>([]);
  readonly loadingFotos  = signal(false);
  readonly firmas         = computed(() => this.fotos().filter(f => f.pictureTypeName === 'Signature'));
  readonly fotosGenerales = computed(() => this.fotos().filter(f => f.pictureTypeName !== 'Signature'));
  readonly identDocs        = signal<IdentDocResponse[]>([]);
  readonly loadingIdentDocs = signal(false);
  readonly showIdentDocDialog = signal(false);
  readonly newDocTypeId       = signal('');
  readonly newNumero          = signal('');
  readonly newFechaCaducidad  = signal('');
  readonly savingIdentDoc     = signal(false);
  readonly identDocError      = signal<string | null>(null);
  protected agentAppTableId: string | null = null;
  readonly notas         = signal<NotaResponse[]>([]);
  readonly loadingNotas  = signal(false);
  readonly documentos    = signal<DocumentoResponse[]>([]);
  readonly loadingDocs   = signal(false);
  readonly activeTab     = signal<'documentos' | 'notas' | 'pictures'>('documentos');
  readonly tabs = computed(() => [
    { id: 'documentos' as const, label: 'Documentos', icon: 'lucideFileText',   count: this.documentos().length },
    { id: 'notas'      as const, label: 'Notas',      icon: 'lucideStickyNote', count: this.notas().length },
    { id: 'pictures'   as const, label: 'Imágenes',   icon: 'lucideImages',     count: this.fotos().length },
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.agentId = id;
      this.loading.set(true);
      this.api.get<AgentResponse>(`/catalog/agents/${id}`).subscribe({
        next: data => {
          this.callSign.set(data.callSign ?? '');
          this.firstName.set(data.firstName);
          this.lastName.set(data.lastName ?? '');
          this.unitId.set(data.unitId ?? '');
          this.unitName.set(data.unitName ?? '');
          this.active.set(data.active);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('No se pudo cargar el agente.');
          this.loading.set(false);
        },
      });
      this.loadingFotos.set(true);
      this.loadingNotas.set(true);
      this.loadingDocs.set(true);
      this.loadingIdentDocs.set(true);
      this.appTableSvc.getByTableName('t100_agents').subscribe({
        next: table => {
          this.agentAppTableId = table.id;
          this.api.get<FotoResponse[]>(
            `/inventory/pictures?tableId=${table.id}&recordId=${id}`
          ).subscribe({
            next:  fotos => { this.fotos.set(fotos.map(f => ({ id: f.id, filePath: f.filePath, pictureTypeName: f.pictureTypeName, esPrincipal: f.esPrincipal, caption: f.caption, filename: f.filename, createdAt: f.createdAt }))); this.loadingFotos.set(false); },
            error: ()    => this.loadingFotos.set(false),
          });
          this.api.get<DocumentoResponse[]>(
            `/inventory/documents?tableId=${table.id}&recordId=${id}`
          ).subscribe({
            next:  docs => { this.documentos.set(docs); this.loadingDocs.set(false); },
            error: ()   => this.loadingDocs.set(false),
          });
          this.api.get<NotaResponse[]>(
            `/inventory/notes?tableId=${table.id}&recordId=${id}`
          ).subscribe({
            next:  notas => { this.notas.set(notas); this.loadingNotas.set(false); },
            error: ()    => this.loadingNotas.set(false),
          });
          this.api.get<IdentDocResponse[]>(
            `/inventory/ident-docs?tableId=${table.id}&recordId=${id}`
          ).subscribe({
            next:  docs => { this.identDocs.set(docs); this.loadingIdentDocs.set(false); },
            error: ()   => this.loadingIdentDocs.set(false),
          });
        },
        error: () => {
          this.loadingFotos.set(false);
          this.loadingNotas.set(false);
          this.loadingDocs.set(false);
          this.loadingIdentDocs.set(false);
        },
      });
    }
  }

  exportarFicha(): void {
    // TODO: implementar exportación de ficha del agente
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
    // TODO: implementar endpoint PATCH para marcar como principal
    // Por ahora actualiza el estado local optimistamente
    this.fotos.update(list => list.map(f => ({
      ...f,
      esPrincipal: f.id === id ? true : (f.pictureTypeName === list.find(x => x.id === id)?.pictureTypeName ? false : f.esPrincipal),
    })));
  }

  openIdentDocDialog(): void {
    this.newDocTypeId.set('');
    this.newNumero.set('');
    this.newFechaCaducidad.set('');
    this.identDocError.set(null);
    this.showIdentDocDialog.set(true);
  }

  closeIdentDocDialog(): void {
    this.showIdentDocDialog.set(false);
  }

  saveIdentDoc(): void {
    if (!this.newNumero().trim()) {
      this.identDocError.set('El número de documento es obligatorio.');
      return;
    }
    this.savingIdentDoc.set(true);
    this.identDocError.set(null);
    const body = {
      appTableId:     this.agentAppTableId,
      recordId:       this.agentId,
      docTypeId:      this.newDocTypeId() || null,
      numero:         this.newNumero().trim(),
      fechaCaducidad: this.newFechaCaducidad() || null,
    };
    this.api.post<IdentDocResponse>('/inventory/ident-docs', body).subscribe({
      next: doc => {
        this.identDocs.update(list => [doc, ...list]);
        this.savingIdentDoc.set(false);
        this.showIdentDocDialog.set(false);
      },
      error: () => {
        this.identDocError.set('Error al guardar el documento.');
        this.savingIdentDoc.set(false);
      },
    });
  }

  formatDate(iso: string): string {
    const [y, m, d] = iso.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  save(): void {
    const firstName = this.firstName().trim();
    const unitId    = this.unitId().trim();

    if (!firstName) { this.saveError.set('El nombre es obligatorio.'); return; }
    if (!unitId)    { this.saveError.set('La unidad es obligatoria.'); return; }

    this.saving.set(true);
    this.saveError.set(null);
    this.savedOk.set(false);

    const body: AgentRequest = {
      callSign:  this.callSign().trim() || null,
      firstName,
      lastName:  this.lastName().trim() || null,
      unitId,
      active:    this.active(),
    };

    if (this.isEdit()) {
      this.api.put<AgentResponse>(`/catalog/agents/${this.agentId}`, body).subscribe({
        next: data => {
          this.firstName.set(data.firstName);
          this.lastName.set(data.lastName ?? '');
          this.saving.set(false);
          this.savedOk.set(true);
        },
        error: () => { this.saveError.set('Error al guardar. Inténtalo de nuevo.'); this.saving.set(false); },
      });
    } else {
      this.api.post<AgentResponse>('/catalog/agents', body).subscribe({
        next: data => this.router.navigate(['/common/agents', data.id]),
        error: () => { this.saveError.set('Error al crear el agente.'); this.saving.set(false); },
      });
    }
  }

  confirmDelete(): void {
    this.api.delete(`/catalog/agents/${this.agentId}`).subscribe({
      next: () => this.router.navigate(['/common/admin/t100_agents']),
      error: () => {
        this.deleteState.set('closed');
        this.loadError.set('Error al eliminar el agente.');
      },
    });
  }
}
