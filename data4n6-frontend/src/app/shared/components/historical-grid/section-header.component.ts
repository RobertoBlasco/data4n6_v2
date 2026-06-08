import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmButtonImports, HlmIconImports],
  providers: [provideIcons({ lucidePlus })],
  styles: [':host { display: block; }'],
  template: `
    <div class="flex items-center gap-2">
      <ng-icon hlmIcon [name]="icon()" size="sm" class="text-[#005a3b] shrink-0" />
      <span class="text-xs font-medium text-[#005a3b] uppercase tracking-wide whitespace-nowrap">{{ title() }}</span>
      <div class="flex-1 h-px bg-border"></div>
      <ng-content />
      @if (showAdd()) {
        <button hlmBtn variant="outline" size="icon" class="size-6 shrink-0" (click)="add.emit()">
          <ng-icon hlmIcon name="lucidePlus" size="sm" />
        </button>
      }
    </div>
  `,
})
export class SectionHeaderComponent {
  readonly title   = input.required<string>();
  readonly icon    = input.required<string>();
  readonly showAdd = input<boolean>(false);
  readonly add     = output<void>();
}
