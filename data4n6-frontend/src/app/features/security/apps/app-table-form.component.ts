import {
  ChangeDetectionStrategy, Component, OnInit,
  inject, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideDatabase, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { BrnDialogContent } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { FormReadonlyDirective } from '../../../shared/form/form-readonly.directive';
import { FormBase } from '../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../shared/form/spa-form-header.component';
import { SpaFormFooterComponent } from '../../../shared/form/spa-form-footer.component';
import { FkComboboxComponent } from '../../../shared/components/fk-combobox/fk-combobox.component';

const BASE = 'http://localhost:8080/api/v1/catalog';
type DialogState = 'open' | 'closed' | null;

interface AppTableResponse {
  id: string;
  tableName: string | null;
  displayName: string | null;
  description: string | null;
  nombreSingular: string | null;
  nombrePlural: string | null;
  icono: string | null;
  vistas: string | null;
  endpointBase: string | null;
  seccionMenu: string | null;
  ordenMenu: number | null;
  formFields: string | null;
  dbSchema: string | null;
  formRoute: string | null;
  application: { id: string; name: string | null; displayName: string | null } | null;
}

@Component({
  selector: 'app-app-table-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmSpinnerImports, HlmIconImports,
    BrnDialogContent, HlmDialogImports,
    SpaFormHeaderComponent, SpaFormFooterComponent, FkComboboxComponent, FormReadonlyDirective,
  ],
  providers: [provideIcons({ lucideDatabase, lucideTrash2 })],
  template: `
    <div class="h-full flex flex-col min-h-0" [appFormReadonly]="formReadonly()">

      <app-spa-form-header
        [icon]="formIcon()"
        [label]="fTableName() || 'Tabla'"
        [readonly]="fTableName() ? false : null"
        [description]="fDisplayName() || ''"
        [backRoute]="resolvedBackRoute()">
      </app-spa-form-header>

      <div class="flex-1 overflow-auto p-6 space-y-6">

        @if (loading()) {
          <div class="flex items-center justify-center py-20"><hlm-spinner /></div>
        }

        @if (loadError() && !loading()) {
          <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{{ loadError() }}</div>
        }

        @if (!loading() && !loadError()) {

          <!-- Identificación -->
          <div>
            <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-3">Identificación</p>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-start max-w-2xl">
              <label hlmLabel class="pt-2 whitespace-nowrap">Nombre tabla</label>
              <input hlmInput class="w-full" [ngModel]="fTableName()" (ngModelChange)="fTableName.set($event)" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Nombre visible</label>
              <input hlmInput class="w-full" [ngModel]="fDisplayName()" (ngModelChange)="fDisplayName.set($event)" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Descripción</label>
              <input hlmInput class="w-full" [ngModel]="fDescription()" (ngModelChange)="fDescription.set($event)" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Aplicación</label>
              <app-fk-combobox endpoint="/catalog/apps" [baseUrl]="'http://localhost:8080/api/v1'"
                [value]="fApplicationId()" (valueChange)="fApplicationId.set($event)" />
            </div>
          </div>

          <!-- Nomenclatura -->
          <div>
            <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-3">Nomenclatura</p>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-start max-w-2xl">
              <label hlmLabel class="pt-2 whitespace-nowrap">Singular</label>
              <input hlmInput class="w-full" [ngModel]="fNombreSingular()" (ngModelChange)="fNombreSingular.set($event)" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Plural</label>
              <input hlmInput class="w-full" [ngModel]="fNombrePlural()" (ngModelChange)="fNombrePlural.set($event)" />
            </div>
          </div>

          <!-- UI / Menú -->
          <div>
            <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-3">UI / Menú</p>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-start max-w-2xl">
              <label hlmLabel class="pt-2 whitespace-nowrap">Icono</label>
              <input hlmInput class="w-full" [ngModel]="fIcono()" (ngModelChange)="fIcono.set($event)" placeholder="lucideXxx" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Vistas</label>
              <select class="h-9 w-full rounded-md border border-primary bg-action/5 px-3 text-sm text-[#005a3b] focus:outline-none focus:ring-1 focus:ring-ring"
                [ngModel]="fVistas()" (ngModelChange)="fVistas.set($event)">
                <option value="GRID">GRID</option>
                <option value="FORM">FORM</option>
                <option value="GRID_FORM">GRID + FORM</option>
              </select>

              <label hlmLabel class="pt-2 whitespace-nowrap">Sección menú</label>
              <input hlmInput class="w-full" [ngModel]="fSeccionMenu()" (ngModelChange)="fSeccionMenu.set($event)" placeholder="ej. inventory_catalog" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Orden menú</label>
              <input hlmInput type="number" class="w-32"
                [ngModel]="fOrdenMenu()" (ngModelChange)="fOrdenMenu.set($event ? +$event : null)" />
            </div>
          </div>

          <!-- Técnico -->
          <div>
            <p class="text-xs font-semibold text-[#005a3b] uppercase tracking-wide mb-3">Técnico</p>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-start max-w-2xl">
              <label hlmLabel class="pt-2 whitespace-nowrap">Endpoint base</label>
              <input hlmInput class="w-full" [ngModel]="fEndpointBase()" (ngModelChange)="fEndpointBase.set($event)" placeholder="/api/v1/..." />

              <label hlmLabel class="pt-2 whitespace-nowrap">Schema BD</label>
              <input hlmInput class="w-full" [ngModel]="fDbSchema()" (ngModelChange)="fDbSchema.set($event)" placeholder="ej. inventario" />

              <label hlmLabel class="pt-2 whitespace-nowrap">Ruta formulario</label>
              <input hlmInput readonly class="w-full" style="background-color:#f0f0f0" [value]="fFormRoute() || '—'" />

              <label hlmLabel class="pt-2 whitespace-nowrap align-top mt-2">Form fields</label>
              <textarea class="w-full min-h-[80px] rounded-md border border-primary bg-action/5 px-3 py-2 text-xs text-[#005a3b] focus:outline-none focus:ring-1 focus:ring-ring font-mono resize-y"
                [ngModel]="fFormFields()" (ngModelChange)="fFormFields.set($event)" placeholder="JSON..."></textarea>
            </div>
          </div>

        }
      </div>

      <app-spa-form-footer>
        <button hlmBtn variant="outline" class="h-7 shrink-0 text-red-600 border-red-400 hover:bg-red-50" size="sm" (click)="openDelete()">
          <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />Eliminar
        </button>
        <button hlmBtn size="sm" class="h-7" [disabled]="saving()" (click)="save()">
          @if (saving()) { <hlm-spinner class="mr-1" /> } Guardar
        </button>
      </app-spa-form-footer>

    </div>

    <!-- Diálogo borrar -->
    <hlm-dialog [state]="deleteState()" (stateChanged)="onDeleteState($event)">
      <ng-template brnDialogContent>
        <hlm-dialog-content class="sm:max-w-sm" [showCloseButton]="false">
          <div class="bg-destructive text-destructive-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
            <ng-icon hlmIcon size="sm" name="lucideDatabase" />
            <h2 class="text-sm font-semibold">¿Eliminar tabla?</h2>
          </div>
          <p class="text-sm text-muted-foreground py-2">Se eliminará <strong>{{ fTableName() }}</strong>. Esta acción no se puede deshacer.</p>
          <div hlmDialogFooter class="gap-2">
            <button hlmBtn variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white" hlmDialogClose>Cancelar</button>
            <button hlmBtn variant="outline" class="h-8 shrink-0 text-red-600 border-red-400 hover:bg-red-50" (click)="confirmDelete()">Eliminar</button>
          </div>
        </hlm-dialog-content>
      </ng-template>
    </hlm-dialog>
  `,
})
export class AppTableFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName  = 't900_app_tables';
  protected override readonly icon              = 'lucideDatabase';
  protected override readonly labelSingular     = 'Tabla del sistema';
  protected override readonly defaultBackRoute  = '/security/app-tables';
  override entityDescription(): string { return this.fTableName(); }

  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http   = inject(HttpClient);

  override readonly loading     = signal(true);
  override readonly loadError   = signal<string | null>(null);
  override readonly saving      = signal(false);
  override readonly deleteState = signal<'open' | 'closed' | null>(null);

  readonly fTableName      = signal('');
  readonly fDisplayName    = signal('');
  readonly fDescription    = signal('');
  readonly fNombreSingular = signal('');
  readonly fNombrePlural   = signal('');
  readonly fIcono          = signal('');
  readonly fVistas         = signal('GRID');
  readonly fEndpointBase   = signal('');
  readonly fSeccionMenu    = signal('');
  readonly fOrdenMenu      = signal<number | null>(null);
  readonly fFormFields     = signal('');
  readonly fDbSchema       = signal('');
  readonly fFormRoute      = signal('');
  readonly fApplicationId  = signal('');

  ngOnInit(): void {
    this.loadFormMeta();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<AppTableResponse>(`${BASE}/app-tables/id/${id}`).subscribe({
      next: d => {
        this.fTableName.set(d.tableName ?? '');
        this.fDisplayName.set(d.displayName ?? '');
        this.fDescription.set(d.description ?? '');
        this.fNombreSingular.set(d.nombreSingular ?? '');
        this.fNombrePlural.set(d.nombrePlural ?? '');
        this.fIcono.set(d.icono ?? '');
        this.fVistas.set(d.vistas ?? 'GRID');
        this.fEndpointBase.set(d.endpointBase ?? '');
        this.fSeccionMenu.set(d.seccionMenu ?? '');
        this.fOrdenMenu.set(d.ordenMenu ?? null);
        this.fFormFields.set(d.formFields ?? '');
        this.fDbSchema.set(d.dbSchema ?? '');
        this.fFormRoute.set(d.formRoute ?? '');
        this.fApplicationId.set(d.application?.id ?? '');
        this.loading.set(false);
      },
      error: () => { this.loadError.set('No se pudo cargar la tabla.'); this.loading.set(false); },
    });
  }

  save(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.saving.set(true);
    const body = {
      tableName:      this.fTableName()      || null,
      displayName:    this.fDisplayName()    || null,
      description:    this.fDescription()    || null,
      nombreSingular: this.fNombreSingular() || null,
      nombrePlural:   this.fNombrePlural()   || null,
      icono:          this.fIcono()          || null,
      vistas:         this.fVistas()         || 'GRID',
      endpointBase:   this.fEndpointBase()   || null,
      seccionMenu:    this.fSeccionMenu()    || null,
      ordenMenu:      this.fOrdenMenu(),
      formFields:     this.fFormFields()     || null,
      dbSchema:       this.fDbSchema()       || null,
      applicationId:  this.fApplicationId() || null,
    };
    this.http.put(`${BASE}/app-tables/${id}`, body).subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/security/app-tables']); },
      error: () => this.saving.set(false),
    });
  }

  override openDelete(): void { this.deleteState.set('open'); }
  onDeleteState(s: string): void { if (s === 'closed') this.deleteState.set(null); }

  confirmDelete(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.delete(`${BASE}/app-tables/${id}`).subscribe({
      next: () => this.router.navigate(['/security/app-tables']),
    });
  }
}
