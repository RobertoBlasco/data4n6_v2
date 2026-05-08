import { Routes } from '@angular/router';

export const evidenceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./evidence-list/evidence-list.component').then(m => m.EvidenceListComponent),
  },
  {
    path: 'statuses',
    loadComponent: () =>
      import('./catalogs/evidence-statuses.component').then(m => m.EvidenceStatusesComponent),
  },
];
