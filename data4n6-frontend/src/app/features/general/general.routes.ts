import { Routes } from '@angular/router';

export const generalRoutes: Routes = [
  {
    path: '',
    redirectTo: 'units',
    pathMatch: 'full',
  },
  {
    path: 'units',
    loadComponent: () =>
      import('./units/units.component').then(m => m.UnitsComponent),
  },
  {
    path: 'persons',
    loadComponent: () =>
      import('./persons/persons.component').then(m => m.PersonsComponent),
  },
  {
    path: 'persons/new',
    loadComponent: () =>
      import('./persons/person-form.component').then(m => m.PersonFormComponent),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./documents/documents.component').then(m => m.DocumentsComponent),
  },
  {
    path: 'photos',
    loadComponent: () =>
      import('./photos/photos.component').then(m => m.PhotosComponent),
  },
];
