import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'data4n6',
    component: ShellComponent,
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
  { path: '**', redirectTo: '' },
];
