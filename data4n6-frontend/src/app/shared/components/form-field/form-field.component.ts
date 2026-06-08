import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { FORM_READONLY } from '../../form/form-readonly.token';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmLabelImports],
  styles: [':host { display: block; }'],
  template: `
    @if (layout() === 'horizontal') {
      <label hlmLabel class="pt-2 whitespace-nowrap self-start"
        [class.text-muted-foreground]="isReadonly()">
        {{ label() }}
        @if (required() && !isReadonly()) { <span class="text-destructive ml-0.5">*</span> }
      </label>
      <div>
        <ng-content />
        @if (error() && !isReadonly()) {
          <p class="text-xs text-destructive mt-1">{{ error() }}</p>
        }
      </div>
    } @else {
      <div class="space-y-1">
        <label hlmLabel [class.text-muted-foreground]="isReadonly()">
          {{ label() }}
          @if (required() && !isReadonly()) { <span class="text-destructive ml-0.5">*</span> }
        </label>
        <ng-content />
        @if (error() && !isReadonly()) {
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

  private readonly _formReadonly = inject(FORM_READONLY, { optional: true });

  /** true cuando el formulario padre está en modo solo lectura */
  readonly isReadonly = computed(() => this._formReadonly?.() === true);

  constructor() {
    const el = inject(ElementRef);
    effect(() => {
      el.nativeElement.style.display = this.layout() === 'horizontal' ? 'contents' : 'block';
    });
  }
}
