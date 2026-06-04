INSERT INTO seguridad.t900_app_tables
    (t000_app_tables_id, table_name, display_name, description, db_schema)
VALUES
    (gen_random_uuid(), 't900_app_tables',  'Tablas',            'Registro de tablas de la aplicación',  'seguridad'),
    (gen_random_uuid(), 't600_ordenes_baja','Órdenes de Baja',   'Órdenes de baja de material',          'inventario')
ON CONFLICT (table_name) DO NOTHING;
