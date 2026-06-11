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

interface NoteItem    { id: string; body: string; createdAt: string; }
interface PendingNote { tempId: string; body: string; }

@Component({
  selector: 'app-t300-notes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, HlmButtonImports, HlmIconImports, HlmSpinnerImports, HistoricalGridComponent],
  providers: [provideIcons({ lucidePlus, lucideTrash2 })],
  host: { class: 'block' },
  template: `
    <div class="flex gap-3 items-end mb-4 pb-4 border-b border-border">
      <div class="flex-1">
        <label class="block text-muted-foreground mb-1" style="font-size:10px">NUEVA NOTA</label>
        <textarea class="w-full border border-border rounded-md px-3 py-2 resize-none bg-surface-primary text-[#005a3b]"
          rows="3" placeholder="Escribe una nota..."
          [value]="newText()"
          (input)="newText.set($any($event.target).value)"></textarea>
      </div>
      <button hlmBtn size="sm" class="h-9 gap-1.5 shrink-0"
        [disabled]="!newText().trim() || saving()"
        (click)="save()">
        @if (saving()) { <hlm-spinner class="size-3.5" /> }
        @else { <ng-icon hlmIcon name="lucidePlus" size="sm" /> }
        Añadir
      </button>
    </div>
    <app-historical-grid [loading]="loading()" [empty]="items().length === 0 && pending().length === 0" emptyMessage="Sin notas registradas">
      <thead class="bg-[#005a3b] text-white">
        <tr>
          <th class="text-left font-normal px-3 py-1.5 w-8"></th>
          <th class="text-left font-normal px-3 py-1.5">Nota</th>
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
            <td class="px-3 py-1.5 text-[#005a3b]">{{ p.body }}</td>
            <td class="px-3 py-1.5 whitespace-nowrap"><span class="text-amber-600 italic" style="font-size:10px">Pendiente</span></td>
          </tr>
        }
        @for (n of items(); track n.id; let odd = $odd) {
          <tr class="border-b border-border/40 last:border-0" [class.bg-surface-primary]="odd">
            <td class="px-2 py-1.5">
              <button hlmBtn variant="ghost" size="icon" class="size-6 text-destructive hover:text-destructive" (click)="delete(n.id)">
                <ng-icon hlmIcon size="sm" name="lucideTrash2" />
              </button>
            </td>
            <td class="px-3 py-1.5 text-[#005a3b]" [innerHTML]="n.body"></td>
            <td class="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{{ n.createdAt | date:'dd/MM/yy' }}</td>
          </tr>
        }
      </tbody>
    </app-historical-grid>
  `,
})
export class NotesComponent {
  private readonly http = inject(HttpClient);

  readonly recordId   = input<string | null>(null);
  readonly appTableId = input<string | null>(null);

  readonly items   = signal<NoteItem[]>([]);
  readonly pending = signal<PendingNote[]>([]);
  readonly loading = signal(false);
  readonly newText = signal('');
  readonly saving  = signal(false);
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
    this.http.get<NoteItem[]>(`${BASE}/inventory/notes?tableId=${tableId}&recordId=${recordId}`)
      .subscribe({ next: d => { this.items.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  private flushPending(recordId: string, tableId: string): void {
    this.pending().forEach(p =>
      this.http.post<NoteItem>(`${BASE}/inventory/notes`, { appTableId: tableId, recordId, body: p.body })
        .subscribe({ next: n => this.items.update(l => [...l, n]) })
    );
    this.pending.set([]);
  }

  save(): void {
    const body = this.newText().trim();
    if (!body) return;
    const recordId = this.recordId();
    const tableId  = this.appTableId();
    if (!recordId || !tableId) {
      this.pending.update(l => [{ tempId: `tmp-${Date.now()}`, body }, ...l]);
      this.newText.set('');
      return;
    }
    this.saving.set(true);
    this.http.post<NoteItem>(`${BASE}/inventory/notes`, { appTableId: tableId, recordId, body })
      .subscribe({
        next:  n => { this.items.update(l => [n, ...l]); this.newText.set(''); this.saving.set(false); },
        error: () => this.saving.set(false),
      });
  }

  delete(id: string): void {
    this.http.delete(`${BASE}/inventory/notes/${id}`)
      .subscribe({ next: () => this.items.update(l => l.filter(n => n.id !== id)) });
  }

  deletePending(tempId: string): void {
    this.pending.update(l => l.filter(n => n.tempId !== tempId));
  }
}
