import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-historical-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmIconImports, HlmSpinnerImports],
  styles: [':host { display: block; }'],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-8">
        <hlm-spinner />
      </div>
    } @else if (empty()) {
      <div class="border-2 border-border rounded-md px-3 py-8 text-center text-[#005a3b] italic text-sm">
        {{ emptyMessage() }}
      </div>
    } @else {
      <div class="border-2 border-border rounded-md overflow-hidden">
        <table class="w-full text-sm border-collapse">
          <ng-content />
        </table>
      </div>
    }
  `,
})
export class HistoricalGridComponent {
  readonly loading      = input<boolean>(false);
  readonly empty        = input<boolean>(false);
  readonly emptyMessage = input<string>('Sin registros');
}
