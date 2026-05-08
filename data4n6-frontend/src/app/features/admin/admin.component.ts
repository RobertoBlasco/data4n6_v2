import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `
    <h1 class="page-title">Administración</h1>
    <p class="placeholder">Usuarios, roles, permisos, gestión de tenants...</p>
  `,
  styles: [`
    .page-title { margin: 0 0 8px; font-size: 1.6rem; color: #01603e; }
    .placeholder { color: #6b7280; }
  `],
})
export class AdminComponent {}
