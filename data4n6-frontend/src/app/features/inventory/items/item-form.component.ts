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
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FormBase } from '../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../shared/form/spa-form-header.component';
import { DeleteConfirmDialogComponent } from '../../../shared/form/delete-confirm-dialog.component';
import { PicturePanelComponent, PictureItem } from '../../../shared/components/picture-panel/picture-panel.component';
import { AppTableService } from '../../../core/services/app-table.service';
import { ApiService } from '../../../core/services/api.service';

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
  id:              string;
  pictureTypeId:   string | null;
  pictureTypeName: string | null;
  esPrincipal:     boolean;
  filename:        string;
  filePath:        string;
  caption:         string | null;
  createdAt:       string;
}

const API = 'http://localhost:8080/api/v1/inventory/articulos';

@Component({
  selector: 'app-item-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports, HlmLabelImports, HlmInputImports,
    HlmSpinnerImports, HlmIconImports,
    SpaFormHeaderComponent,
    DeleteConfirmDialogComponent,
    PicturePanelComponent,
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
          <div class="flex gap-6 items-stretch">

            <!-- Columna izquierda: fotos -->
            <div class="w-64 shrink-0 flex flex-col">
              <app-picture-panel class="flex-1"
                title="Fotos"
                icon="lucidePackage"
                [appTableId]="articuoAppTableId ?? ''"
                [recordId]="articuloId() ?? ''"
                pictureTypeId=""
                [pictures]="fotos()"
                [loading]="loadingFotos()"
                (delete)="onDeleteFoto($event)"
                (setPrincipal)="onSetPrincipal($event)"
                (pictureAdded)="onPictureAdded($event)" />
            </div>

            <!-- Columna derecha: campos -->
            <div class="max-w-sm w-full space-y-4">

              <div class="space-y-1.5">
                <label hlmLabel>Tipo de material</label>
                <input hlmInput readonly class="w-full" style="background-color:#f0f0f0" [value]="tipoMaterialNombre() || '—'" />
              </div>

              <div class="space-y-1.5">
                <label hlmLabel>Marca</label>
                <input hlmInput readonly class="w-full" style="background-color:#f0f0f0" [value]="brandName() || '—'" />
              </div>

              <div class="space-y-1.5">
                <label hlmLabel>Modelo</label>
                <input hlmInput readonly class="w-full" style="background-color:#f0f0f0" [value]="modeloDescripcion() || '—'" />
              </div>

              <div class="space-y-1.5">
                <label hlmLabel>N.º de serie</label>
                <input hlmInput readonly class="w-full" style="background-color:#f0f0f0" [value]="serialNumber() || '—'" />
              </div>

              <div class="space-y-1.5">
                <label hlmLabel>Estado actual</label>
                <input hlmInput readonly class="w-full" style="background-color:#f0f0f0" [value]="estadoActual() || '—'" />
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

  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly http        = inject(HttpClient);
  private readonly api         = inject(ApiService);
  private readonly appTableSvc = inject(AppTableService);

  readonly isView = computed(() => !!this.route.snapshot.paramMap.get('id'));

  readonly articuloId         = signal<string | null>(null);
  readonly serialNumber       = signal('');
  readonly tipoMaterialId     = signal('');
  readonly tipoMaterialNombre = signal('');
  readonly brandId            = signal('');
  readonly brandName          = signal('');
  readonly modeloId           = signal('');
  readonly modeloDescripcion  = signal('');
  readonly almacenId          = signal('');
  readonly almacenNombre      = signal('');
  readonly estadoActual       = signal('');

  readonly fotos        = signal<PictureItem[]>([]);
  readonly loadingFotos = signal(false);
  articuoAppTableId: string | null = null;

  ngOnInit(): void {
    if (!this.isView()) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.articuloId.set(id);

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
        this.estadoActual.set(data.estadoActual ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el artículo.');
        this.loading.set(false);
      },
    });

    this.loadingFotos.set(true);
    this.appTableSvc.getByTableName('t100_articulos').subscribe({
      next: table => {
        this.articuoAppTableId = table.id;
        this.api.get<FotoResponse[]>(
          `/inventory/pictures?tableId=${table.id}&recordId=${id}`
        ).subscribe({
          next: fotos => {
            this.fotos.set(fotos.map(f => ({
              id: f.id, filePath: f.filePath, pictureTypeName: f.pictureTypeName,
              esPrincipal: f.esPrincipal, caption: f.caption,
              filename: f.filename, createdAt: f.createdAt,
            })));
            this.loadingFotos.set(false);
          },
          error: () => this.loadingFotos.set(false),
        });
      },
      error: () => this.loadingFotos.set(false),
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
    this.fotos.update(list => list.map(f => ({
      ...f,
      esPrincipal: f.id === id ? true
        : (f.pictureTypeName === list.find(x => x.id === id)?.pictureTypeName ? false : f.esPrincipal),
    })));
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
