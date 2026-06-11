import { ChangeDetectionStrategy, Component, computed, input, signal, viewChild } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideStickyNote, lucideFileText, lucideImages } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { NotesComponent } from '../t300-notes/t300-notes.component';
import { DocumentsComponent } from '../t300-documents/t300-documents.component';
import { PicturesComponent } from '../t300-pictures/t300-pictures.component';

type TabId = 'notas' | 'documentos' | 'fotos';

@Component({
  selector: 'app-standar-tab-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconImports, NotesComponent, DocumentsComponent, PicturesComponent],
  providers: [provideIcons({ lucideStickyNote, lucideFileText, lucideImages })],
  host: { class: 'flex-1 min-h-[11rem] flex flex-col border border-[#005a3b]/40 rounded-md overflow-hidden' },
  template: `
    <!-- Tab bar -->
    <div class="shrink-0 flex items-end gap-0.5 border-b border-[#E5E7EB] px-2">
      @for (tab of tabs(); track tab.id) {
        <button
          class="flex items-center gap-1.5 px-4 py-2 -mb-px border-b-2 transition-colors"
          [class.border-[#005a3b]]="activeTab() === tab.id"
          [class.font-semibold]="activeTab() === tab.id"
          [class.text-[#005a3b]]="activeTab() === tab.id"
          [class.border-transparent]="activeTab() !== tab.id"
          [class.text-muted-foreground]="activeTab() !== tab.id"
          (click)="activeTab.set(tab.id)">
          <ng-icon hlmIcon [name]="tab.icon" size="sm" />
          {{ tab.label }}
          <span class="inline-flex items-center justify-center rounded-full px-1.5 tabular-nums leading-4 transition-opacity"
            style="font-size:10px; min-width:1.3rem; background:#E5E7EB; color:#4B5563;"
            [style.opacity]="tab.count === 0 ? '0.4' : '1'">
            {{ tab.count }}
          </span>
        </button>
      }
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-auto p-4 bg-muted/10">
      <div [hidden]="activeTab() !== 'notas'">
        <app-t300-notes [recordId]="recordId()" [appTableId]="appTableId()" />
      </div>
      <div [hidden]="activeTab() !== 'documentos'">
        <app-t300-documents [recordId]="recordId()" [appTableId]="appTableId()" />
      </div>
      <div [hidden]="activeTab() !== 'fotos'">
        <app-t300-pictures [recordId]="recordId()" [appTableId]="appTableId()" />
      </div>
    </div>
  `,
})
export class StandarTabPanelComponent {
  readonly recordId   = input<string | null>(null);
  readonly appTableId = input<string | null>(null);

  readonly activeTab = signal<TabId>('notas');

  private readonly notasRef = viewChild(NotesComponent);
  private readonly docsRef  = viewChild(DocumentsComponent);
  private readonly fotosRef = viewChild(PicturesComponent);

  readonly tabs = computed(() => [
    { id: 'notas'      as TabId, label: 'Notas',      icon: 'lucideStickyNote', count: this.notasRef()?.count() ?? 0 },
    { id: 'documentos' as TabId, label: 'Documentos', icon: 'lucideFileText',   count: this.docsRef()?.count()  ?? 0 },
    { id: 'fotos'      as TabId, label: 'Imágenes',   icon: 'lucideImages',     count: this.fotosRef()?.count() ?? 0 },
  ]);
}
