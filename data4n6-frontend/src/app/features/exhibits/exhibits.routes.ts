import { Routes } from '@angular/router';

export const exhibitsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./exhibits-list/exhibits-list.component').then(m => m.ExhibitsListComponent),
  },
  {
    path: 'statuses',
    loadComponent: () =>
      import('./catalogs/exhibit-statuses.component').then(m => m.ExhibitStatusesComponent),
  },
];
