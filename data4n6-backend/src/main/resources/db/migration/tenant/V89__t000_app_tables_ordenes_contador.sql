INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t600_ordenes_contador', 'Contador de órdenes', 'Contador de referencias por tipo de evento y año para órdenes de inventario')
ON CONFLICT (table_name) DO NOTHING;
