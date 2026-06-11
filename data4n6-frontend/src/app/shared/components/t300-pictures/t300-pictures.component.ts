import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HistoricalGridComponent } from '../historical-grid/historical-grid.component';

const BASE = 'http://localhost:8080/api/v1';

interface PictureItem    { id: string; filename: string; caption: string | null; createdAt: string; }
interface PendingPicture { tempId: string; file: File; filename: string; }

@Component({
  selector: 'app-t300-pictures',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, HlmButtonImports, HlmIconImports, HlmSpinnerImports, HistoricalGridComponent],
  providers: [provideIcons({ lucidePlus, lucideTrash2 })],
  host: { class: 'block' },
  template: `
    <div class="flex items-center gap-3 mb-4 pb-4 border-b border-border">
      <label hlmBtn variant="outline" size="sm" class="h-9 cursor-pointer gap-1.5">
        <ng-icon hlmIcon name="lucidePlus" size="sm" />
        Subir imagen
        <input type="file" accept="image/*" class="hidden" (change)="upload($event)" />
      </label>
      <span class="text-muted-foreground" style="font-size:10px">JPG, PNG, WEBP…</span>
    </div>
    <app-historical-grid [loading]="loading()" [empty]="items().length === 0 && pending().length === 0" emptyMessage="Sin imágenes registradas">
      <thead class="bg-[#005a3b] text-white">
        <tr>
          <th class="text-left font-normal px-3 py-1.5 w-8"></th>
          <th class="text-left font-normal px-3 py-1.5">Fichero</th>
          <th class="text-left font-normal px-3 py-1.5 whitespace-nowrap w-24">Fecha</th>
        </tr>
      </thead>
      <tbody>
        @for (p of pending(); track p.tempId) {
          <tr class="border-b border-border/40 last:border-0 bg-amber-50">
            <td class="px-2 py-1.5">
              <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" (click)="deletePending(p.tempId)">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" />
              </button>
            </td>
            <td class="px-3 py-1.5 text-[#005a3b] truncate max-w-[14rem]">{{ p.filename }}</td>
            <td class="px-3 py-1.5 whitespace-nowrap"><span class="text-amber-600 italic" style="font-size:10px">Pendiente</span></td>
          </tr>
        }
        @for (f of items(); track f.id; let odd = $odd) {
          <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
            <td class="px-2 py-1.5">
              <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" (click)="delete(f.id)">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" />
              </button>
            </td>
            <td class="px-3 py-1.5 text-[#005a3b] truncate max-w-[14rem]">{{ f.filename }}</td>
            <td class="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{{ f.createdAt | date:'dd/MM/yy' }}</td>
          </tr>
        }
      </tbody>
    </app-historical-grid>
  `,
})
export class PicturesComponent {
  private readonly http = inject(HttpClient);

  readonly recordId   = input<string | null>(null);
  readonly appTableId = input<string | null>(null);

  readonly items   = signal<PictureItem[]>([]);
  readonly pending = signal<PendingPicture[]>([]);
  readonly loading = signal(false);
  readonly count   = computed(() => this.items().length + this.pending().length);

  constructor() {
    effect(() => {
      const id      = this.recordId();
      const tableId = this.appTableId();
      if (!id || !tableId) return;
      this.flushPending(id, tableId);
      this.load(id, tableId);
    });
  }

  private load(recordId: string, tableId: string): void {
    this.loading.set(true);
    this.http.get<PictureItem[]>(`${BASE}/inventory/pictures?tableId=${tableId}&recordId=${recordId}`)
      .subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  private flushPending(recordId: string, tableId: string): void {
    this.pending().forEach(p => {
      const fd = new FormData();
      fd.append('appTableId', tableId);
      fd.append('recordId', recordId);
      fd.append('file', p.file);
      this.http.post<PictureItem>(`${BASE}/inventory/pictures/upload`, fd)
        .subscribe({ next: f => this.items.update(l => [...l, f]) });
    });
    this.pending.set([]);
  }

  upload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    (event.target as HTMLInputElement).value = '';
    const recordId = this.recordId();
    const tableId  = this.appTableId();
    if (!recordId || !tableId) {
      this.pending.update(l => [{ tempId: `tmp-${Date.now()}`, file, filename: file.name }, ...l]);
      return;
    }
    const fd = new FormData();
    fd.append('appTableId', tableId);
    fd.append('recordId', recordId);
    fd.append('file', file);
    this.http.post<PictureItem>(`${BASE}/inventory/pictures/upload`, fd)
      .subscribe({ next: f => this.items.update(l => [f, ...l]) });
  }

  delete(id: string): void {
    this.http.delete(`${BASE}/inventory/pictures/${id}`)
      .subscribe({ next: () => this.items.update(l => l.filter(f => f.id !== id)) });
  }

  deletePending(tempId: string): void {
    this.pending.update(l => l.filter(f => f.tempId !== tempId));
  }
}
