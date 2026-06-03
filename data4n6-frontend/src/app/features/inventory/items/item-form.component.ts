import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePackage } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FormBase } from '../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../shared/form/spa-form-header.component';
import { DeleteConfirmDialogComponent } from '../../../shared/form/delete-confirm-dialog.component';
import { FkComboboxComponent } from '../../../shared/components/fk-combobox/fk-combobox.component';

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
}

const API = 'http://localhost:8080/api/v1/inventory/articulos';

@Component({
  selector: 'app-item-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports, HlmLabelImports,
    HlmSpinnerImports, HlmIconImports,
    SpaFormHeaderComponent,
    DeleteConfirmDialogComponent,
    FkComboboxComponent,
  ],
  providers: [provideIcons({ lucideTrash2, lucidePackage })],
  template: `
    <div class="h-full flex flex-col min-h-0">

      <app-spa-form-header
        [icon]="icon"
        [label]="isView() ? 'Artículo' : 'Nuevo artículo'"
        [description]="serialNumber()"
        backRoute="/inventory/items">
        @if (isView()) {
          <button hlmBtn variant="destructive" size="sm" class="h-7"
            [disabled]="loading()"
            (click)="openDelete()">
            <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />
            Eliminar
          </button>
        }
      </app-spa-form-header>

      <!-- Cuerpo -->
      <div class="flex-1 overflow-auto p-6">

        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <hlm-spinner />
          </div>
        }

        @if (loadError() && !loading()) {
          <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {{ loadError() }}
          </div>
        }

        @if (!loading() && !loadError()) {
          <div class="max-w-lg space-y-6">

            <!-- Campos — solo lectura en modo vista -->
            <div [class.pointer-events-none]="isView()" [class.opacity-70]="isView()">

              <div class="space-y-1.5 mb-6">
                <label hlmLabel>N.º de serie</label>
                <div class="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-1 text-sm">
                  {{ serialNumber() || '—' }}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="space-y-1.5">
                  <label hlmLabel>Tipo de material</label>
                  <app-fk-combobox
                    endpoint="/api/v1/inventory/tipos-material"
                    [value]="tipoMaterialId()"
                    [displayHint]="tipoMaterialNombre()"
                    (valueChange)="tipoMaterialId.set($event)" />
                </div>
                <div class="space-y-1.5">
                  <label hlmLabel>Marca</label>
                  <app-fk-combobox
                    endpoint="/api/v1/inventory/marcas"
                    [value]="brandId()"
                    [displayHint]="brandName()"
                    (valueChange)="onBrandChange($event)" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label hlmLabel>Modelo</label>
                  <app-fk-combobox
                    [endpoint]="modeloEndpoint()"
                    [value]="modeloId()"
                    [displayHint]="modeloDescripcion()"
                    (valueChange)="modeloId.set($event)" />
                </div>
                <div class="space-y-1.5">
                  <label hlmLabel>Almacén</label>
                  <app-fk-combobox
                    endpoint="/api/v1/inventory/almacenes"
                    [value]="almacenId()"
                    [displayHint]="almacenNombre()"
                    (valueChange)="almacenId.set($event)" />
                </div>
              </div>

            </div>

          </div>
        }
      </div>

    </div>

    @if (isView()) {
      <app-delete-confirm-dialog
        [icon]="icon"
        label="Artículo"
        [description]="serialNumber() || 'este artículo'"
        [state]="deleteState()"
        (stateChanged)="onDeleteStateChanged($event)"
        (confirmed)="confirmDelete()" />
    }
  `,
})
export class ItemFormComponent extends FormBase implements OnInit {
  protected override readonly icon          = 'lucidePackage';
  protected override readonly labelSingular = 'Artículo';
  override entityDescription(): string { return this.serialNumber(); }

  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http   = inject(HttpClient);

  readonly isView = computed(() => !!this.route.snapshot.paramMap.get('id'));

  readonly serialNumber       = signal('');
  readonly tipoMaterialId     = signal('');
  readonly tipoMaterialNombre = signal('');
  readonly brandId            = signal('');
  readonly brandName          = signal('');
  readonly modeloId           = signal('');
  readonly modeloDescripcion  = signal('');
  readonly almacenId          = signal('');
  readonly almacenNombre      = signal('');

  readonly modeloEndpoint = computed(() =>
    this.brandId()
      ? `/api/v1/inventory/modelos?marcaId=${this.brandId()}`
      : '/api/v1/inventory/modelos'
  );

  ngOnInit(): void {
    if (!this.isView()) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<Articulo>(`${API}/${id}`).subscribe({
      next: data => {
        this.serialNumber.set(data.serialNumber ?? '');
        this.tipoMaterialId.set(data.tipoMaterialId ?? '');
        this.tipoMaterialNombre.set(data.tipoMaterialNombre ?? '');
        this.brandId.set(data.brandId ?? '');
        this.brandName.set(data.brandName ?? '');
        this.modeloId.set(data.modeloId ?? '');
        this.modeloDescripcion.set(data.modeloDescripcion ?? '');
        this.almacenId.set(data.almacenId ?? '');
        this.almacenNombre.set(data.almacenNombre ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el artículo.');
        this.loading.set(false);
      },
    });
  }

  onBrandChange(id: string): void {
    this.brandId.set(id);
    this.brandName.set('');
    this.modeloId.set('');
    this.modeloDescripcion.set('');
  }

  confirmDelete(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.delete(`${API}/${id}`).subscribe({
      next:  () => this.router.navigate(['/inventory/items']),
      error: () => {
        this.deleteState.set('closed');
        this.loadError.set('Error al eliminar el artículo.');
      },
    });
  }
}
