-- Rename t200_materials → t200_materiales
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'inventario' AND tablename = 't200_materials') THEN
        ALTER TABLE inventario.t200_materials RENAME TO t200_materiales;
        ALTER TABLE inventario.t200_materiales RENAME COLUMN t200_materials_id TO t200_materiales_id;

        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 't200_materials_name_unique') THEN
            ALTER TABLE inventario.t200_materiales
                RENAME CONSTRAINT t200_materials_name_unique TO t200_materiales_name_unique;
        END IF;
    END IF;
END $$;

-- Update catalog entry so MetadataService can resolve by table name
UPDATE common.t000_app_tables
SET table_name   = 't200_materiales',
    display_name = 'Tipos de material'
WHERE table_name = 't200_materials';
