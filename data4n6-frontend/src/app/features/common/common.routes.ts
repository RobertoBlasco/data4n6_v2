import { Routes } from '@angular/router';

export const commonRoutes: Routes = [
  {
    path: '',
    redirectTo: 'units',
    pathMatch: 'full',
  },
  {
    path: 'doc-types',
    loadComponent: () =>
      import('./docs/doc-types-list.component').then(m => m.DocTypesListComponent),
  },
  {
    path: 'document-types',
    loadComponent: () =>
      import('./docs/document-types-list.component').then(m => m.DocumentTypesListComponent),
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./units/units-list.component').then(m => m.UnitsListComponent),
  },
  {
    path: 'agents',
    loadComponent: () =>
      import('./agents/agents-list.component').then(m => m.AgentsListComponent),
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
