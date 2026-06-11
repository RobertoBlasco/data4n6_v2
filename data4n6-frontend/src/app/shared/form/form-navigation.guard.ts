import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { FormBase } from './form-base';

/**
 * Guard para prevenir la navegación cuando hay cambios sin guardar.
 * Se aplica a componentes que extienden FormBase.
 */
export const formNavigationGuard: CanDeactivateFn<FormBase> = (component) => {
  if (component.navigationLocked()) {
    return confirm(
      '¿Estás seguro de que deseas salir?\n\n' +
      'Tienes cambios sin guardar que se perderán.'
    );
  }
  return true;
};
