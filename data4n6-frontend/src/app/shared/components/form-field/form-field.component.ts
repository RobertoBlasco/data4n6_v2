import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmLabelImports],
  styles: [':host { display: block; }'],
  template: `
    @if (layout() === 'horizontal') {
      <label hlmLabel class="pt-2 whitespace-nowrap self-start">
        {{ label() }}
        @if (required()) { <span class="text-destructive ml-0.5">*</span> }
      </label>
      <div>
        <ng-content />
        @if (error()) {
          <p class="text-xs text-destructive mt-1">{{ error() }}</p>
        }
      </div>
    } @else {
      <div class="space-y-1">
        <label hlmLabel>
          {{ label() }}
          @if (required()) { <span class="text-destructive ml-0.5">*</span> }
        </label>
        <ng-content />
        @if (error()) {
          <p class="text-xs text-destructive mt-1">{{ error() }}</p>
        }
      </div>
    }
  `,
})
export class FormFieldComponent {
  readonly label    = input.required<string>();
  readonly required = input<boolean>(false);
  readonly error    = input<string | null>(null);
  readonly layout   = input<'vertical' | 'horizontal'>('vertical');

  constructor() {
    const el = inject(ElementRef);
    effect(() => {
      el.nativeElement.style.display = this.layout() === 'horizontal' ? 'contents' : 'block';
    });
  }
}
