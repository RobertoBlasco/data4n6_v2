import { Routes } from '@angular/router';

export const commonRoutes: Routes = [
  {
    path: '',
    redirectTo: 'admin/t100_units',
    pathMatch: 'full',
  },
  {
    path: 'agents/new',
    loadComponent: () =>
      import('./agents/agent-form.component').then(m => m.AgentFormComponent),
  },
  {
    path: 'agents/:id',
    loadComponent: () =>
      import('./agents/agent-form.component').then(m => m.AgentFormComponent),
  },
  {
    path: 'admin/:tableName',
    loadComponent: () =>
      import('../inventory/admin/catalog-admin/catalog-admin.component').then(m => m.CatalogAdminComponent),
  },
];
