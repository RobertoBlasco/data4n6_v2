-- Register t000_app_tables itself as an admin-managed table.
-- Allows editing table metadata (labels, icons, endpoints) through the generic UI.

INSERT INTO common.t000_app_tables
    (t000_app_tables_id, table_name, display_name, description,
     nombre_singular, nombre_plural, icono, vistas,
     endpoint_base, seccion_menu, orden_menu,
     form_fields)
VALUES
    (gen_random_uuid(), 't000_app_tables', 'Admin Tablas',
     'Registro de metadatos de todas las tablas de la aplicación',
     'Tabla de aplicación', 'Admin Tablas', 'lucideDatabase', 'GRID',
     '/api/v1/catalog/app-tables', 'inventory_admin', 0,
     'displayName,nombreSingular,nombrePlural,icono,endpointBase,seccionMenu,ordenMenu,vistas,formFields')
ON CONFLICT (table_name) DO NOTHING;
