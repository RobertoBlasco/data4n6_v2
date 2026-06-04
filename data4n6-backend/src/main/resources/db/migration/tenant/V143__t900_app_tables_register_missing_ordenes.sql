INSERT INTO seguridad.t900_app_tables
    (t000_app_tables_id, table_name, display_name, description, seccion_menu, db_schema)
VALUES
    (gen_random_uuid(), 't600_ordenes_prestamo',   'Órdenes de préstamo',    'Cabecera de órdenes de préstamo',    'inventory_ops', 'inventario'),
    (gen_random_uuid(), 't600_ordenes_adjudicacion','Órdenes de adjudicación','Cabecera de órdenes de adjudicación','inventory_ops', 'inventario'),
    (gen_random_uuid(), 't600_ordenes_entrada',     'Órdenes de entrada',     'Cabecera de órdenes de entrada',     'inventory_ops', 'inventario'),
    (gen_random_uuid(), 't600_ordenes_traspaso',    'Órdenes de traspaso',    'Cabecera de órdenes de traspaso',    'inventory_ops', 'inventario')
ON CONFLICT (table_name) DO NOTHING;
