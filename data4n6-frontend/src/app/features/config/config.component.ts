import { Component } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: true,
  template: `
    <h1 class="page-title">Configuración</h1>
    <p class="placeholder">Estados de casos y eventos, niveles de clasificación, parámetros del sistema...</p>
  `,
  styles: [`
    .page-title { margin: 0 0 8px; font-size: 1.6rem; color: #01603e; }
    .placeholder { color: #6b7280; }
  `],
})
export class ConfigComponent {}
