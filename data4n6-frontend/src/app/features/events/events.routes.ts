import { Routes } from '@angular/router';

export const eventsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./events-list/events-list.component').then(m => m.EventsListComponent),
  },
  {
    path: 'statuses',
    loadComponent: () =>
      import('./catalogs/event-statuses.component').then(m => m.EventStatusesComponent),
  },
];
