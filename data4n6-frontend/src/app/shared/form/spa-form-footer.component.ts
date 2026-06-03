import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-spa-form-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shrink-0 flex items-center justify-end gap-2
                px-4 h-11 border-t border-border bg-background">
      <ng-content />
    </div>
  `,
})
export class SpaFormFooterComponent {}
