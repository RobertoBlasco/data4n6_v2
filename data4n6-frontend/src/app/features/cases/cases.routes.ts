import { Routes } from '@angular/router';

export const casesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./cases-list/cases-list.component').then(m => m.CasesListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./case-form/case-form.component').then(m => m.CaseFormComponent),
  },
  {
    path: 'statuses',
    loadComponent: () =>
      import('./catalogs/case-statuses.component').then(m => m.CaseStatusesComponent),
  },
  {
    path: 'levels',
    loadComponent: () =>
      import('./catalogs/case-levels.component').then(m => m.CaseLevelsComponent),
  },
  {
    path: 'outcomes',
    loadComponent: () =>
      import('./catalogs/case-outcomes.component').then(m => m.CaseOutcomesComponent),
  },
  {
    path: 'domains',
    loadComponent: () =>
      import('./catalogs/case-domains.component').then(m => m.CaseDomainsComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./case-detail/case-detail.component').then(m => m.CaseDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./case-form/case-form.component').then(m => m.CaseFormComponent),
  },
];
