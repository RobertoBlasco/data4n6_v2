import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucideTrash2,
  lucideSave,
  lucideFlaskConical,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FormReadonlyDirective } from '../../../shared/form/form-readonly.directive';
import { FormBase } from '../../../shared/form/form-base';
import { SpaFormHeaderComponent } from '../../../shared/form/spa-form-header.component';
import { DeleteConfirmDialogComponent } from '../../../shared/form/delete-confirm-dialog.component';

interface TipoMaterial {
  id: string;
  name: string;
  description: string | null;
}

interface TipoMaterialRequest {
  name: string;
  description: string | null;
}

const API = 'http://localhost:8080/api/v1/inventory/tipos-material';

@Component({
  selector: 'app-material-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmSpinnerImports, HlmIconImports,
    SpaFormHeaderComponent, FormReadonlyDirective,
    DeleteConfirmDialogComponent,
  ],
  providers: [provideIcons({ lucideTrash2, lucideSave, lucideFlaskConical })],
  template: `
    <div class="h-full flex flex-col min-h-0" [appFormReadonly]="formReadonly()">

      <app-spa-form-header
        [icon]="formIcon()" [label]="formTitle() || labelSingular" [description]="entityDescription()"
        [readonly]="item() ? false : null"
        [backRoute]="resolvedBackRoute()">
        <button hlmBtn variant="outline" class="h-7 shrink-0 text-red-600 border-red-400 hover:bg-red-50" size="sm"
          [disabled]="loading() || saving()"
          (click)="openDelete()">
          <ng-icon hlmIcon size="sm" name="lucideTrash2" class="mr-1" />
          Eliminar
        </button>
        <button hlmBtn size="sm" class="h-7"
          [disabled]="loading() || saving()"
          (click)="save()">
          @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
          @else { <ng-icon hlmIcon size="sm" name="lucideSave" class="mr-1" /> }
          Guardar
        </button>
      </app-spa-form-header>

      <!-- ── Cuerpo ─────────────────────────────────────────────────────────── -->
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

            <!-- Nombre -->
            <div class="space-y-1.5">
              <label hlmLabel for="name">
                Nombre <span class="text-destructive">*</span>
              </label>
              <input hlmInput id="name" class="w-full" placeholder="Ej. Aluminio"
                [ngModel]="name()"
                (ngModelChange)="name.set($event); savedOk.set(false)" />
            </div>

            <!-- Descripción -->
            <div class="space-y-1.5">
              <label hlmLabel for="description">Descripción</label>
              <textarea
                id="description"
                class="flex min-h-[100px] w-full rounded-md border border-primary bg-action/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="Descripción opcional"
                [ngModel]="description()"
                (ngModelChange)="description.set($event); savedOk.set(false)"
              ></textarea>
            </div>

          </div>
        }

      </div>

    </div>

    <app-delete-confirm-dialog
      [icon]="icon"
      [label]="labelSingular"
      [description]="entityDescription()"
      [state]="deleteState()"
      (stateChanged)="onDeleteStateChanged($event)"
      (confirmed)="confirmDelete()" />
  `,
})
export class MaterialFormComponent extends FormBase implements OnInit {
  protected override readonly colMetaTableName  = 't200_materiales';
  protected override readonly icon              = 'lucideFlaskConical';
  protected override readonly labelSingular     = 'Tipo de material';
  protected override readonly defaultBackRoute  = '/inventory/materials';
  override entityDescription(): string { return this.item()?.name ?? ''; }

  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http   = inject(HttpClient);

  item        = signal<TipoMaterial | null>(null);
  name        = signal('');
  description = signal('');

  ngOnInit(): void {
    this.loadFormMeta();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<TipoMaterial>(`${API}/${id}`).subscribe({
      next: data => {
        this.item.set(data);
        this.name.set(data.name);
        this.description.set(data.description ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el tipo de material.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    const name = this.name().trim();
    if (!name) { this.saveError.set('El nombre es obligatorio.'); return; }

    this.saving.set(true);
    this.saveError.set(null);
    this.savedOk.set(false);

    const body: TipoMaterialRequest = { name, description: this.description().trim() || null };

    this.http.put<TipoMaterial>(`${API}/${this.item()!.id}`, body).subscribe({
      next: data => {
        this.item.set(data);
        this.name.set(data.name);
        this.description.set(data.description ?? '');
        this.saving.set(false);
        this.savedOk.set(true);
      },
      error: () => {
        this.saveError.set('Error al guardar. Inténtalo de nuevo.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(): void {
    this.http.delete(`${API}/${this.item()!.id}`).subscribe({
      next: () => this.router.navigate(['/inventory/materials']),
      error: () => {
        this.deleteState.set('closed');
        this.loadError.set('Error al eliminar el tipo de material.');
      },
    });
  }
}
