-- Rename t100_inventory_items → t100_articulos

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'inventario' AND tablename = 't100_inventory_items') THEN

        -- Rename indexes
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND indexname = 'idx_t100_inventory_items_category') THEN
            ALTER INDEX inventario.idx_t100_inventory_items_category  RENAME TO idx_t100_articulos_categoria;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND indexname = 'idx_t100_inventory_items_brand') THEN
            ALTER INDEX inventario.idx_t100_inventory_items_brand     RENAME TO idx_t100_articulos_marca;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND indexname = 'idx_t100_inventory_items_status') THEN
            ALTER INDEX inventario.idx_t100_inventory_items_status    RENAME TO idx_t100_articulos_estado;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND indexname = 'idx_t100_inventory_items_warehouse') THEN
            ALTER INDEX inventario.idx_t100_inventory_items_warehouse RENAME TO idx_t100_articulos_almacen;
        END IF;

        -- Rename PK column
        ALTER TABLE inventario.t100_inventory_items
            RENAME COLUMN t100_inventory_items_id TO t100_articulos_id;

        -- Rename table
        ALTER TABLE inventario.t100_inventory_items RENAME TO t100_articulos;

    END IF;
END $$;

-- Update catalog entry
UPDATE common.t000_app_tables
SET table_name   = 't100_articulos',
    display_name = 'Artículos',
    description  = 'Artículos físicos del inventario'
WHERE table_name = 't100_inventory_items';
