-- Hybrid metadata pattern for inventory module:
-- - Keep deleted_at per table (used in all list queries)
-- - Move created_at, updated_at, created_by, updated_by → t500_metadata

SET search_path = tenant_default;

-- ── 1. Register inventory tables in common.t000_app_tables ──────────────────
INSERT INTO common.t000_app_tables (table_name, display_name, description) VALUES
    ('t200_marcas',                'Marcas',               'Catálogo de marcas del inventario'),
    ('t200_materials',             'Materiales',           'Catálogo de materiales'),
    ('t200_item_categories',       'Categorías',           'Categorías de artículos del inventario'),
    ('t200_item_statuses',         'Estados de artículo',  'Estados de artículos del inventario'),
    ('t200_warehouse_entry_types', 'Tipos de entrada',     'Tipos de entrada a almacén'),
    ('t100_warehouses',            'Almacenes',            'Almacenes del inventario'),
    ('t100_inventory_items',       'Artículos',            'Artículos del inventario')
ON CONFLICT (table_name) DO NOTHING;

-- ── 2. Create or adapt t500_metadata ────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'inventory' AND tablename = 't500_metadata'
    ) THEN
        CREATE TABLE inventory.t500_metadata (
            t500_metadata_id    UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
            record_uuid         UUID        NOT NULL,
            t000_app_tables_id  UUID        NOT NULL,
            created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
            created_by          VARCHAR(100),
            updated_by          VARCHAR(100),
            CONSTRAINT t500_metadata_record_uuid_unique UNIQUE (record_uuid),
            CONSTRAINT t500_metadata_t000_app_tables_fk
                FOREIGN KEY (t000_app_tables_id)
                REFERENCES common.t000_app_tables(t000_app_tables_id)
        );
        CREATE INDEX idx_t500_metadata_app_table ON inventory.t500_metadata(t000_app_tables_id);

    ELSE
        -- Adapt existing manually-created table

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'inventory' AND table_name = 't500_metadata'
              AND column_name = 't000_app_tables_id'
        ) THEN
            ALTER TABLE inventory.t500_metadata ADD COLUMN t000_app_tables_id UUID;
        END IF;

        -- Populate from nombre_tabla if that column still exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'inventory' AND table_name = 't500_metadata'
              AND column_name = 'nombre_tabla'
        ) THEN
            UPDATE inventory.t500_metadata m
            SET t000_app_tables_id = at.t000_app_tables_id
            FROM common.t000_app_tables at
            WHERE at.table_name = m.nombre_tabla
              AND m.t000_app_tables_id IS NULL;
            ALTER TABLE inventory.t500_metadata DROP COLUMN nombre_tabla;
        END IF;

        -- Set NOT NULL + FK if not already constrained
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = 'inventory.t500_metadata'::regclass
              AND contype = 'f'
              AND conname = 't500_metadata_t000_app_tables_fk'
        ) THEN
            ALTER TABLE inventory.t500_metadata
                ALTER COLUMN t000_app_tables_id SET NOT NULL,
                ADD CONSTRAINT t500_metadata_t000_app_tables_fk
                    FOREIGN KEY (t000_app_tables_id)
                    REFERENCES common.t000_app_tables(t000_app_tables_id);
        END IF;

        -- Add UNIQUE on record_uuid if missing
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conrelid = 'inventory.t500_metadata'::regclass
              AND contype = 'u'
              AND conname = 't500_metadata_record_uuid_unique'
        ) THEN
            ALTER TABLE inventory.t500_metadata
                ADD CONSTRAINT t500_metadata_record_uuid_unique UNIQUE (record_uuid);
        END IF;

        -- Add created_by / updated_by if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'inventory' AND table_name = 't500_metadata'
              AND column_name = 'created_by'
        ) THEN
            ALTER TABLE inventory.t500_metadata ADD COLUMN created_by VARCHAR(100);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'inventory' AND table_name = 't500_metadata'
              AND column_name = 'updated_by'
        ) THEN
            ALTER TABLE inventory.t500_metadata ADD COLUMN updated_by VARCHAR(100);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'inventory' AND tablename = 't500_metadata'
              AND indexname = 'idx_t500_metadata_app_table'
        ) THEN
            CREATE INDEX idx_t500_metadata_app_table ON inventory.t500_metadata(t000_app_tables_id);
        END IF;
    END IF;
END $$;

-- ── 3. Migrate audit data → t500_metadata ───────────────────────────────────
-- Each block checks that audit columns still exist before migrating.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't200_marcas'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t200_marcas_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t200_marcas m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't200_marcas'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t200_marcas_id
              )
        $q$;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't200_materials'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t200_materials_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t200_materials m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't200_materials'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t200_materials_id
              )
        $q$;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't200_item_categories'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t200_item_categories_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t200_item_categories m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't200_item_categories'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t200_item_categories_id
              )
        $q$;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't200_item_statuses'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t200_item_statuses_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t200_item_statuses m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't200_item_statuses'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t200_item_statuses_id
              )
        $q$;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't200_warehouse_entry_types'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t200_warehouse_entry_types_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t200_warehouse_entry_types m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't200_warehouse_entry_types'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t200_warehouse_entry_types_id
              )
        $q$;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't100_warehouses'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t100_warehouses_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t100_warehouses m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't100_warehouses'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t100_warehouses_id
              )
        $q$;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't100_inventory_items'
                 AND column_name = 'created_at') THEN
        EXECUTE $q$
            INSERT INTO inventory.t500_metadata
                (t500_metadata_id, record_uuid, t000_app_tables_id, created_at, updated_at, created_by, updated_by)
            SELECT gen_random_uuid(), m.t100_inventory_items_id, at.t000_app_tables_id,
                   m.created_at, m.updated_at, m.created_by, m.updated_by
            FROM inventory.t100_inventory_items m
            CROSS JOIN common.t000_app_tables at
            WHERE at.table_name = 't100_inventory_items'
              AND NOT EXISTS (
                  SELECT 1 FROM inventory.t500_metadata md WHERE md.record_uuid = m.t100_inventory_items_id
              )
        $q$;
    END IF;
END $$;

-- ── 4. Drop audit columns from entity tables (keep deleted_at) ───────────────

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't200_marcas'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t200_marcas DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't200_materials'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t200_materials DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't200_item_categories'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t200_item_categories DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't200_item_statuses'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t200_item_statuses DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't200_warehouse_entry_types'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t200_warehouse_entry_types DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't100_warehouses'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t100_warehouses DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE cols TEXT[] := ARRAY['created_at', 'updated_at', 'created_by', 'updated_by'];
        col  TEXT;
BEGIN
    FOREACH col IN ARRAY cols LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'inventory' AND table_name = 't100_inventory_items'
                     AND column_name = col) THEN
            EXECUTE 'ALTER TABLE inventory.t100_inventory_items DROP COLUMN ' || col;
        END IF;
    END LOOP;
END $$;

-- ── 5. Rename FK column t100_inventory_items.t200_brands_id → t200_marcas_id ─
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'inventory' AND table_name = 't100_inventory_items'
                 AND column_name = 't200_brands_id') THEN
        ALTER TABLE inventory.t100_inventory_items RENAME COLUMN t200_brands_id TO t200_marcas_id;
    END IF;
END $$;
