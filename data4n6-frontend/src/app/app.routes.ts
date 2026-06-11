import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { HorizontalShellComponent } from './layout/horizontal-shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'inventory',
    component: HorizontalShellComponent,
    data: { module: 'inventory' },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes),
      },
    ],
  },
  {
    path: 'data4n6',
    component: ShellComponent,
    data: { module: 'data4n6' },
    children: [
      { path: '', redirectTo: 'cases', pathMatch: 'full' },
      {
        path: 'cases',
        loadChildren: () =>
          import('./features/cases/cases.routes').then(m => m.casesRoutes),
      },
      {
        path: 'events',
        loadChildren: () =>
          import('./features/events/events.routes').then(m => m.eventsRoutes),
      },
      {
        path: 'exhibits',
        loadChildren: () =>
          import('./features/exhibits/exhibits.routes').then(m => m.exhibitsRoutes),
      },
      {
        path: 'evidence',
        loadChildren: () =>
          import('./features/evidence/evidence.routes').then(m => m.evidenceRoutes),
      },
      {
        path: 'general',
        loadChildren: () =>
          import('./features/general/general.routes').then(m => m.generalRoutes),
      },
      {
        path: 'config',
        loadChildren: () =>
          import('./features/config/config.routes').then(m => m.configRoutes),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then(m => m.adminRoutes),
      },
    ],
  },
  {
    path: 'common',
    component: ShellComponent,
    data: { module: 'common' },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/common/common.routes').then(m => m.commonRoutes),
      },
    ],
  },
  {
    path: 'security',
    component: ShellComponent,
    data: { module: 'security' },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/security/security.routes').then(m => m.securityRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
