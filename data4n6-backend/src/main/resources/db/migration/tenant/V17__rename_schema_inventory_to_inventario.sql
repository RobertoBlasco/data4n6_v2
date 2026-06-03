-- Rename schema inventory → inventario
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'inventory') THEN
        ALTER SCHEMA inventory RENAME TO inventario;
    END IF;
END $$;
