import {
  ChangeDetectionStrategy, Component,
  computed, effect, inject, input, output, signal, untracked,
} from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft, lucideChevronRight,
  lucideTrash2, lucideStar, lucideStarOff, lucidePlus, lucideUpload, lucideExpand,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { SectionHeaderComponent } from '../historical-grid/section-header.component';
import { environment } from '../../../../environments/environment';

export interface PictureItem {
  id:              string;
  filePath:        string;
  pictureTypeName: string | null;
  esPrincipal:     boolean;
  caption:         string | null;
  filename:        string;
  createdAt:       string;
}

@Component({
  selector: 'app-picture-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LowerCasePipe, HlmButtonImports, HlmIconImports, HlmInputImports, HlmLabelImports, HlmSpinnerImports, SectionHeaderComponent],
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight, lucideTrash2, lucideStar, lucideStarOff, lucidePlus, lucideUpload, lucideExpand })],
  styles: [':host { display: flex; flex-direction: column; gap: 0.5rem; height: 100%; }'],
  template: `
    <app-section-header
      [title]="title()" [icon]="icon()"
      [showAdd]="true" (add)="openDialog()" />

    @if (loading()) {
      <div class="flex flex-1 items-center justify-center"><hlm-spinner /></div>
    } @else if (pictures().length === 0) {
      <div class="flex flex-1 flex-col items-center justify-center gap-2
                  rounded-md border-2 border-dashed border-border cursor-pointer hover:bg-muted/30 transition-colors"
        (click)="openDialog()">
        <ng-icon hlmIcon [name]="icon()" class="text-muted-foreground" size="xl" />
        <span class="text-xs text-muted-foreground italic">Sin imágenes</span>
      </div>
    } @else {
      <!-- Imagen actual -->
      <div class="relative flex-1 min-h-0 rounded border border-border overflow-hidden bg-white">
        <img [src]="current().filePath" [alt]="current().caption ?? current().pictureTypeName ?? ''"
          class="absolute inset-0 w-full h-full object-contain"
          (error)="$any($event.target).style.display='none'" />
        <button hlmBtn variant="ghost" size="icon"
          class="absolute top-1 right-1 size-6 bg-black/25 hover:bg-black/50 text-white"
          title="Imagen completa" (click)="lightboxOpen.set(true)">
          <ng-icon hlmIcon name="lucideExpand" size="xs" />
        </button>
        @if (pictures().length > 1) {
          <button hlmBtn variant="ghost" size="icon"
            class="absolute left-1 top-1/2 -translate-y-1/2 size-7 bg-black/25 hover:bg-black/50 text-white"
            (click)="prev()">
            <ng-icon hlmIcon name="lucideChevronLeft" size="sm" />
          </button>
          <button hlmBtn variant="ghost" size="icon"
            class="absolute right-1 top-1/2 -translate-y-1/2 size-7 bg-black/25 hover:bg-black/50 text-white"
            (click)="next()">
            <ng-icon hlmIcon name="lucideChevronRight" size="sm" />
          </button>
        }
      </div>

      <!-- Pie -->
      <div class="shrink-0 flex items-center gap-1.5">
        @if (pictures().length > 1) {
          <span class="text-[10px] text-muted-foreground tabular-nums shrink-0">
            {{ currentIndex() + 1 }} / {{ pictures().length }}
          </span>
        }
        <span class="text-[10px] text-[#005a3b] truncate flex-1">{{ current().pictureTypeName ?? '—' }}</span>
        <button hlmBtn variant="ghost" size="icon" class="size-6 shrink-0"
          [class.text-yellow-500]="current().esPrincipal"
          [class.text-muted-foreground]="!current().esPrincipal"
          [title]="current().esPrincipal ? 'Principal' : 'Marcar como principal'"
          (click)="setPrincipal.emit(current().id)">
          <ng-icon hlmIcon [name]="current().esPrincipal ? 'lucideStar' : 'lucideStarOff'" size="sm" />
        </button>
        <button hlmBtn variant="ghost" size="icon"
          class="size-6 shrink-0 text-muted-foreground hover:text-destructive"
          title="Eliminar" (click)="delete.emit(current().id)">
          <ng-icon hlmIcon name="lucideTrash2" size="sm" />
        </button>
      </div>
    }

    <!-- Lightbox -->
    @if (lightboxOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        (mousedown.self)="lightboxOpen.set(false)">
        <img [src]="current().filePath" [alt]="current().caption ?? current().pictureTypeName ?? ''"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl" />
        <button hlmBtn variant="ghost" size="icon"
          class="absolute top-4 right-4 size-9 bg-white/10 hover:bg-white/25 text-white"
          (click)="lightboxOpen.set(false)">
          ✕
        </button>
      </div>
    }

    <!-- Diálogo de alta -->
    @if (showDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (mousedown.self)="closeDialog()">
        <div class="bg-background rounded-lg shadow-xl w-96 p-6 space-y-4">

          <div class="flex items-center gap-2">
            <ng-icon hlmIcon [name]="icon()" size="sm" class="text-[#005a3b]" />
            <h3 class="text-sm font-medium text-[#005a3b] uppercase tracking-wide">
              Añadir {{ title() | lowercase }}
            </h3>
          </div>

          @if (uploadError()) {
            <div class="rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {{ uploadError() }}
            </div>
          }

          <!-- Zona de selección de fichero -->
          <div class="space-y-1">
            <label hlmLabel>Imagen <span class="text-destructive">*</span></label>
            <div class="relative border-2 border-dashed border-border rounded-md overflow-hidden"
              [class.border-primary]="previewUrl()">
              @if (previewUrl()) {
                <img [src]="previewUrl()!" class="w-full max-h-48 object-contain bg-muted" />
              } @else {
                <div class="flex flex-col items-center justify-center py-8 gap-2 cursor-pointer"
                  (click)="fileInput.click()">
                  <ng-icon hlmIcon name="lucideUpload" size="lg" class="text-muted-foreground" />
                  <span class="text-xs text-muted-foreground">Haz clic para seleccionar</span>
                </div>
              }
              <input #fileInput type="file" accept="image/*" class="hidden"
                (change)="onFileSelected($event)" />
            </div>
            @if (previewUrl()) {
              <button hlmBtn variant="ghost" size="sm" class="text-xs text-muted-foreground"
                (click)="clearFile()">Cambiar imagen</button>
            }
          </div>

          <!-- Caption -->
          <div class="space-y-1">
            <label hlmLabel>Descripción</label>
            <input hlmInput class="w-full" placeholder="Descripción opcional"
              [value]="newCaption()"
              (input)="newCaption.set($any($event.target).value)" />
          </div>

          <!-- Principal -->
          <div class="flex items-center gap-2">
            <input type="checkbox" id="esPrincipal"
              class="size-4 rounded border-input accent-primary cursor-pointer"
              [checked]="newEsPrincipal()"
              (change)="newEsPrincipal.set($any($event.target).checked)" />
            <label hlmLabel for="esPrincipal" class="cursor-pointer">Marcar como principal</label>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="destructive" size="sm"
              [disabled]="uploading()" (click)="closeDialog()">
              Cancelar
            </button>
            <button hlmBtn size="sm"
              [disabled]="uploading() || !selectedFile()" (click)="upload()">
              @if (uploading()) { <hlm-spinner class="mr-1.5 size-3.5" /> }
              Alta
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class PicturePanelComponent {
  private readonly http = inject(HttpClient);

  readonly appTableId    = input.required<string>();
  readonly recordId      = input.required<string>();
  readonly pictureTypeId = input.required<string>();
  readonly pictures      = input<PictureItem[]>([]);
  readonly loading       = input<boolean>(false);
  readonly title         = input.required<string>();
  readonly icon          = input.required<string>();

  readonly delete       = output<string>();
  readonly setPrincipal = output<string>();
  readonly pictureAdded = output<PictureItem>();

  readonly currentIndex = signal(0);
  readonly current      = computed(() => this.pictures()[this.currentIndex()]);

  readonly lightboxOpen  = signal(false);
  readonly showDialog    = signal(false);
  readonly selectedFile  = signal<File | null>(null);
  readonly previewUrl    = signal<string | null>(null);
  readonly newCaption    = signal('');
  readonly newEsPrincipal = signal(false);
  readonly uploading     = signal(false);
  readonly uploadError   = signal<string | null>(null);

  constructor() {
    effect(() => {
      const len = this.pictures().length;
      untracked(() => {
        if (this.currentIndex() >= len) this.currentIndex.set(Math.max(0, len - 1));
      });
    });
  }

  prev(): void { const l = this.pictures().length; this.currentIndex.update(i => (i - 1 + l) % l); }
  next(): void { const l = this.pictures().length; this.currentIndex.update(i => (i + 1) % l); }

  openDialog(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.newCaption.set('');
    this.newEsPrincipal.set(false);
    this.uploadError.set(null);
    this.showDialog.set(true);
  }

  closeDialog(): void {
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    this.showDialog.set(false);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  clearFile(): void {
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    form.append('appTableId',    this.appTableId());
    form.append('recordId',      this.recordId());
    form.append('pictureTypeId', this.pictureTypeId());
    form.append('esPrincipal',   String(this.newEsPrincipal()));
    if (this.newCaption()) form.append('caption', this.newCaption());

    this.uploading.set(true);
    this.uploadError.set(null);

    this.http.post<PictureItem>(
      `${environment.apiUrl}/inventory/pictures/upload`, form
    ).subscribe({
      next: pic => {
        this.pictureAdded.emit(pic);
        this.closeDialog();
        this.uploading.set(false);
      },
      error: () => {
        this.uploadError.set('Error al subir la imagen. Inténtalo de nuevo.');
        this.uploading.set(false);
      },
    });
  }
}
