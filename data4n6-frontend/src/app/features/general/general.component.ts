import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <h1 class="page-title">Datos Generales</h1>
    <p class="placeholder">Países, divisiones administrativas, catálogos de referencia...</p>
  `,
  styles: [`
    .page-title { margin: 0 0 8px; font-size: 1.6rem; color: #01603e; }
    .placeholder { color: #6b7280; }
  `],
})
export class GeneralComponent {}
