// TEMPLATE: formulario con FkCombobox subordinado + alta rápida
// Copiar y reemplazar: PARENT_ENTITY / CHILD_ENTITY / endpoints / campos del diálogo
//
// PATRÓN CAMPOS DE SÓLO LECTURA (modo vista):
//   - Comboboxes  → <input hlmInput readonly style="background-color: #f0f0f0" [value]="nombreSignal()" />
//   - Date pickers → <input hlmInput type="date" [readonly]="isView()" [style.background-color]="isView() ? '#f0f0f0' : null" [value]="fechaSignal()" />
//   - Los asteriscos (*) y mensajes de error se ocultan con @if (!isView())
//   - Usar [value]="nombre" (no el ID) para mostrar el texto legible
import {
  ChangeDetectionStrategy, Component, OnInit,
  computed, inject, signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { FkComboboxComponent } from './fk-combobox.component';

const BASE = 'http://localhost:8080/api/v1';

@Component({
  selector: 'app-fk-combobox-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmButtonImports, HlmInputImports, HlmLabelImports,
    HlmSpinnerImports, HlmIconImports,
    FkComboboxComponent,
  ],
  providers: [provideIcons({ lucidePlus })],
  template: `
    <!-- ── Combobox simple (sin alta) ─────────────────────────────────────── -->
    <div class="space-y-1">
      <label hlmLabel>PARENT_ENTITY <span class="text-destructive">*</span></label>
      <app-fk-combobox
        endpoint="/parent-endpoint"
        [baseUrl]="BASE"
        [value]="parentId()"
        (valueChange)="parentId.set($event)" />
    </div>

    <!-- ── Combobox subordinado + alta rápida ─────────────────────────────── -->
    <div class="space-y-1">
      <label hlmLabel>CHILD_ENTITY</label>
      <app-fk-combobox
        [endpoint]="childEndpoint()"
        [baseUrl]="BASE"
        [value]="childId()"
        [canCreate]="true"
        createLabel="Nuevo CHILD_ENTITY"
        [refreshKey]="childRefreshKey()"
        (valueChange)="childId.set($event)"
        (create)="openCreateChild()" />
    </div>

    <!-- ── Diálogo alta rápida ─────────────────────────────────────────────── -->
    @if (showCreateDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (mousedown.self)="closeDialog()">
        <div class="bg-background rounded-lg shadow-xl w-96 p-6 space-y-4">

          <div class="flex items-center gap-2">
            <ng-icon hlmIcon name="lucidePlus" size="sm" class="text-[#005a3b]" />
            <h3 class="text-sm font-medium text-[#005a3b] uppercase tracking-wide">
              Nuevo CHILD_ENTITY
            </h3>
          </div>

          @if (dialogError()) {
            <div class="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ dialogError() }}
            </div>
          }

          <div class="space-y-3">
            <!-- Añadir aquí los campos del diálogo -->
            <div class="space-y-1">
              <label hlmLabel>Nombre <span class="text-destructive">*</span></label>
              <input hlmInput class="w-full"
                [value]="newName()"
                (input)="newName.set($any($event.target).value)" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="destructive" size="sm"
              [disabled]="saving()" (click)="closeDialog()">
              Cancelar
            </button>
            <button hlmBtn size="sm"
              [disabled]="saving()" (click)="save()">
              @if (saving()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class FkComboboxTemplateComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly BASE = BASE;

  // ── Combobox padre ────────────────────────────────────────────────────────
  readonly parentId = signal('');

  // ── Combobox hijo (subordinado al padre) ──────────────────────────────────
  readonly childId         = signal('');
  readonly childRefreshKey = signal(0);
  readonly childEndpoint   = computed(() =>
    this.parentId()
      ? `/child-endpoint?parentId=${this.parentId()}`
      : '/child-endpoint'
  );

  // ── Diálogo de alta rápida ────────────────────────────────────────────────
  readonly showCreateDialog = signal(false);
  readonly newName          = signal('');
  readonly saving           = signal(false);
  readonly dialogError      = signal<string | null>(null);

  ngOnInit(): void {
    // Cargar datos iniciales si es necesario
  }

  openCreateChild(): void {
    this.newName.set('');
    this.dialogError.set(null);
    this.showCreateDialog.set(true);
  }

  closeDialog(): void { this.showCreateDialog.set(false); }

  save(): void {
    const name = this.newName().trim();
    if (!name) { this.dialogError.set('El nombre es obligatorio.'); return; }

    this.saving.set(true);
    this.dialogError.set(null);

    const body = {
      name,
      parentId: this.parentId() || null,
      // Añadir aquí los campos del DTO de creación
    };

    this.http.post<{ id: string }>(`${BASE}/child-endpoint`, body).subscribe({
      next: entity => {
        this.childId.set(entity.id);
        this.childRefreshKey.update(k => k + 1);
        this.saving.set(false);
        this.showCreateDialog.set(false);
      },
      error: () => {
        this.dialogError.set('Error al crear el registro.');
        this.saving.set(false);
      },
    });
  }
}
