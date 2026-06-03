-- Rename t200_categorias_articulos → t200_articulos
ALTER TABLE inventario.t200_categorias_articulos RENAME TO t200_articulos;
ALTER TABLE inventario.t200_articulos RENAME COLUMN t200_categorias_articulos_id TO t200_articulos_id;

UPDATE common.t000_app_tables
SET table_name = 't200_articulos'
WHERE table_name = 't200_categorias_articulos';

-- Rename FK column in t100_articulos
ALTER TABLE inventario.t100_articulos RENAME COLUMN t200_categorias_articulos_id TO t200_articulos_id;
