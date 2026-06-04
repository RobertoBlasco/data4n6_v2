import { Routes } from '@angular/router';

export const securityRoutes: Routes = [
  {
    path: '',
    redirectTo: 'profiles',
    pathMatch: 'full',
  },
  {
    path: 'profiles',
    loadComponent: () =>
      import('./profiles/profiles-list.component').then(m => m.ProfilesListComponent),
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./roles/roles-list.component').then(m => m.RolesListComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users-list.component').then(m => m.UsersListComponent),
  },
  {
    path: 'apps',
    loadComponent: () =>
      import('./apps/apps-list.component').then(m => m.AppsListComponent),
  },
  {
    path: 'app-tables',
    loadComponent: () =>
      import('./apps/app-tables-list.component').then(m => m.AppTablesListComponent),
  },
  {
    path: 'app-tables/:id',
    loadComponent: () =>
      import('./apps/app-table-form.component').then(m => m.AppTableFormComponent),
  },
  {
    path: 'table-fields',
    loadComponent: () =>
      import('./apps/table-fields-list.component').then(m => m.TableFieldsListComponent),
  },
];
