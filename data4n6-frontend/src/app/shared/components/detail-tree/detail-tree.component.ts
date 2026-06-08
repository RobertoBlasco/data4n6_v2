import {
  ChangeDetectionStrategy, Component, input, output,
} from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideListTree } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

export interface DetailTreeNode {
  id:     string;
  label:  string;
  icon:   string;
  count?: () => number;
}

@Component({
  selector: 'app-detail-tree',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconImports],
  providers: [provideIcons({ lucideListTree })],
  styles: [':host { display: flex; flex-direction: column; min-height: 0; flex: 1; }'],
  template: `
    <div class="flex-1 min-h-0 flex flex-col border-2 border-primary rounded-lg overflow-hidden">

      <!-- Cabecera -->
      <div class="h-8 flex items-center px-3 bg-[#005a3b] text-white text-xs font-semibold shrink-0">
        <ng-icon hlmIcon size="sm" name="lucideListTree" class="mr-2" />
        Detalles
      </div>

      <!-- Nodos -->
      <div class="flex-1 overflow-auto py-2">
        @for (node of nodes(); track node.id; let last = $last) {
          <div class="flex items-stretch pl-3">

            <!-- Líneas de árbol -->
            <div class="flex flex-col items-center w-4 shrink-0 mr-1">
              <div class="w-px flex-1 bg-border"></div>
              <div class="flex items-center h-4 shrink-0">
                <div class="w-px h-full bg-border"></div>
                <div class="h-px w-2 bg-border"></div>
              </div>
              <div class="w-px flex-1 bg-border" [class.opacity-0]="last"></div>
            </div>

            <!-- Botón del nodo -->
            <button
              class="flex-1 flex items-center gap-2 pr-3 py-1 text-xs transition-colors text-left rounded-md min-w-0"
              [class.bg-primary/10]="activeId() === node.id"
              [class.text-grid-foreground]="activeId() === node.id"
              [class.font-semibold]="activeId() === node.id"
              [class.text-grid-foreground]="activeId() !== node.id"
              [class.hover:!bg-action/25]="activeId() !== node.id"
              (click)="activeIdChange.emit(node.id)">
              <ng-icon hlmIcon size="sm" [name]="node.icon" class="shrink-0" />
              <span class="flex-1 truncate">{{ node.label }}</span>
              @if (node.count && node.count() > 0) {
                <span class="text-[10px] opacity-50 shrink-0 tabular-nums">{{ node.count() }}</span>
              }
            </button>

          </div>
        }
      </div>

    </div>
  `,
})
export class DetailTreeComponent {
  readonly nodes    = input.required<DetailTreeNode[]>();
  readonly activeId = input.required<string>();
  readonly activeIdChange = output<string>();
}
