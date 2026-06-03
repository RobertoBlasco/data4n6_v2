-- Rename t200_brands to t200_marcas and castellanize columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'inventory' AND tablename = 't200_brands') THEN
        ALTER TABLE inventory.t200_brands RENAME TO t200_marcas;
        ALTER TABLE inventory.t200_marcas RENAME COLUMN t200_brands_id TO t200_marcas_id;
        ALTER TABLE inventory.t200_marcas RENAME COLUMN name TO nombre;
        ALTER TABLE inventory.t200_marcas RENAME COLUMN description TO descripcion;
    END IF;
END $$;
