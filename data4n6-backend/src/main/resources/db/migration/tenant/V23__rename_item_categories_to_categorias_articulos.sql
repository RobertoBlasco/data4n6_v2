-- Rename t200_item_categories → t200_categorias_articulos
ALTER TABLE inventario.t200_item_categories RENAME TO t200_categorias_articulos;
ALTER TABLE inventario.t200_categorias_articulos RENAME COLUMN t200_item_categories_id TO t200_categorias_articulos_id;

UPDATE common.t000_app_tables
SET table_name   = 't200_categorias_articulos',
    display_name = 'Categorías de artículos',
    description  = 'Catálogo de categorías de artículos'
WHERE table_name = 't200_item_categories';

-- Rename FK column in t100_articulos
ALTER TABLE inventario.t100_articulos RENAME COLUMN t200_item_categories_id TO t200_categorias_articulos_id;
