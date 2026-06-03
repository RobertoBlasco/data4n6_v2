import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin.component').then(m => m.AdminComponent),
  },
  {
    path: 'app-tables',
    loadComponent: () =>
      import('./app-tables.component').then(m => m.AppTablesComponent),
  },
];
