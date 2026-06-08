import { InjectionToken, Signal } from '@angular/core';

/** Inyectable que indica si el formulario padre está en modo solo lectura. */
export const FORM_READONLY = new InjectionToken<Signal<boolean | null>>('FORM_READONLY');
