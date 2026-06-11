import { Injectable, signal } from '@angular/core';

/**
 * Servicio global para gestionar el bloqueo de navegación cuando hay formularios con cambios sin guardar.
 * Los componentes FormBase registran/desregistran su estado de bloqueo aquí.
 */
@Injectable({ providedIn: 'root' })
export class FormLockService {
  /**
   * Indica si algún formulario tiene la navegación bloqueada.
   * Cuando es true, el menú lateral y otros elementos de navegación deben deshabilitarse.
   */
  readonly isLocked = signal(false);

  /**
   * Mensaje que se mostrará al usuario si intenta navegar.
   */
  readonly lockMessage = signal<string | null>(null);

  /**
   * Registra un bloqueo de navegación.
   * @param message Mensaje opcional a mostrar al usuario
   */
  lock(message?: string): void {
    this.isLocked.set(true);
    if (message) this.lockMessage.set(message);
  }

  /**
   * Libera el bloqueo de navegación.
   */
  unlock(): void {
    this.isLocked.set(false);
    this.lockMessage.set(null);
  }
}
