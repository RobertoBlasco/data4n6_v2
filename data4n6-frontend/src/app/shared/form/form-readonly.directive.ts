import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { FORM_READONLY } from './form-readonly.token';

@Directive({
  selector: '[appFormReadonly]',
  standalone: true,
  providers: [{
    provide:    FORM_READONLY,
    useFactory: () => inject(FormReadonlyDirective).isReadonly,
  }],
})
export class FormReadonlyDirective {
  /** Pasar formReadonly() desde FormBase. */
  readonly isReadonly = input<boolean | null>(null, { alias: 'appFormReadonly' });

  constructor() {
    const el = inject(ElementRef);
    effect(() => {
      el.nativeElement.classList.toggle('form-readonly', this.isReadonly() === true);
    });
  }
}
