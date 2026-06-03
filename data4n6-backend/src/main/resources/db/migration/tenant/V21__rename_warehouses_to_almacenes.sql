-- Rename t100_warehouses → t100_almacenes and update FK in t100_articulos

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'inventario' AND tablename = 't100_warehouses') THEN

        -- Rename indexes
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND indexname = 'idx_t100_inventory_items_warehouse') THEN
            ALTER INDEX inventario.idx_t100_inventory_items_warehouse RENAME TO idx_t100_articulos_almacen;
        END IF;

        -- Rename PK column
        ALTER TABLE inventario.t100_warehouses
            RENAME COLUMN t100_warehouses_id TO t100_almacenes_id;

        -- Rename table
        ALTER TABLE inventario.t100_warehouses RENAME TO t100_almacenes;

    END IF;
END $$;

-- Rename FK column in t100_articulos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventario' AND table_name = 't100_articulos'
                 AND column_name = 't100_warehouses_id') THEN
        ALTER TABLE inventario.t100_articulos
            RENAME COLUMN t100_warehouses_id TO t100_almacenes_id;
    END IF;
END $$;

-- Update catalog entry
UPDATE common.t000_app_tables
SET table_name   = 't100_almacenes',
    display_name = 'Almacenes',
    description  = 'Almacenes del inventario'
WHERE table_name = 't100_warehouses';
