-- Rename t200_item_statuses → t200_estados
ALTER TABLE inventario.t200_item_statuses RENAME TO t200_estados;
ALTER TABLE inventario.t200_estados RENAME COLUMN t200_item_statuses_id TO t200_estados_id;

UPDATE common.t000_app_tables
SET table_name   = 't200_estados',
    display_name = 'Estados',
    description  = 'Catálogo de estados de artículos'
WHERE table_name = 't200_item_statuses';

-- Rename FK column in t100_articulos
ALTER TABLE inventario.t100_articulos RENAME COLUMN t200_item_statuses_id TO t200_estados_id;
