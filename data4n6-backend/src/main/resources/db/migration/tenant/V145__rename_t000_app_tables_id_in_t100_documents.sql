ALTER TABLE inventario.t100_documents
    RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;

-- También en el schema data4n6 si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'data4n6' AND table_name = 't100_documents'
    ) THEN
        ALTER TABLE data4n6.t100_documents
            RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
    END IF;
END $$;
