import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'items',
    pathMatch: 'full',
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./items/items-list.component').then(m => m.ItemsListComponent),
  },
  {
    path: 'items/new',
    loadComponent: () =>
      import('./items/item-form.component').then(m => m.ItemFormComponent),
  },
  {
    path: 'items/:id/edit',
    loadComponent: () =>
      import('./items/item-form.component').then(m => m.ItemFormComponent),
  },
  {
    path: 'items/:id',
    loadComponent: () =>
      import('./items/item-form.component').then(m => m.ItemFormComponent),
  },
  {
    path: 'warehouses',
    loadComponent: () =>
      import('./warehouses/warehouses.component').then(m => m.WarehousesComponent),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/orders-list.component').then(m => m.OrdersListComponent),
  },
  {
    path: 'orders/warehouse-entries',
    loadComponent: () =>
      import('./orders/warehouse-entries/warehouse-entries.component').then(m => m.WarehouseEntriesComponent),
  },
  {
    path: 'orders/loans/new',
    loadComponent: () =>
      import('./orders/loans/loan-form.component').then(m => m.LoanFormComponent),
  },
  {
    path: 'orders/loans/:id/devolucion',
    loadComponent: () =>
      import('./orders/loans/devolucion-form.component').then(m => m.DevolucionFormComponent),
  },
  {
    path: 'orders/loans/:id',
    loadComponent: () =>
      import('./orders/loans/loan-form.component').then(m => m.LoanFormComponent),
  },
  {
    path: 'orders/loans',
    loadComponent: () =>
      import('./orders/loans/loans.component').then(m => m.LoansComponent),
  },
  {
    path: 'orders/returns/new',
    loadComponent: () =>
      import('./orders/returns/return-form.component').then(m => m.ReturnFormComponent),
  },
  {
    path: 'orders/returns',
    loadComponent: () =>
      import('./orders/returns/returns.component').then(m => m.ReturnsComponent),
  },
  {
    path: 'orders/decommissions',
    loadComponent: () =>
      import('./orders/decommissions/decommissions.component').then(m => m.DecommissionsComponent),
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./catalogs/brands.component').then(m => m.BrandsComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./catalogs/categories.component').then(m => m.CategoriesComponent),
  },
  {
    path: 'statuses',
    loadComponent: () =>
      import('./catalogs/item-statuses.component').then(m => m.ItemStatusesComponent),
  },
  {
    path: 'entry-types',
    loadComponent: () =>
      import('./catalogs/entry-types.component').then(m => m.EntryTypesComponent),
  },
  {
    path: 'materials',
    loadComponent: () =>
      import('./catalogs/materials.component').then(m => m.MaterialsComponent),
  },
  {
    path: 'materials/:id',
    loadComponent: () =>
      import('./catalogs/material-form.component').then(m => m.MaterialFormComponent),
  },
  {
    path: 'admin/event-types',
    loadComponent: () =>
      import('./admin/eventos.component').then(m => m.EventosComponent),
  },
  {
    path: 'admin/:tableName',
    loadComponent: () =>
      import('./admin/catalog-admin/catalog-admin.component').then(m => m.CatalogAdminComponent),
  },
];
