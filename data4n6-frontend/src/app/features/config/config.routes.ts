import { Routes } from '@angular/router';

export const configRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./config.component').then(m => m.ConfigComponent),
  },
];
