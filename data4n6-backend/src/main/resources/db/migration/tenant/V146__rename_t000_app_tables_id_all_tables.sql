-- Rename t000_app_tables_id → t900_app_tables_id in all remaining tables

ALTER TABLE inventario.t100_person_links RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
ALTER TABLE inventario.t100_photos       RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
ALTER TABLE inventario.t300_docs         RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
ALTER TABLE inventario.t300_documents    RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
ALTER TABLE inventario.t300_notes        RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
ALTER TABLE inventario.t300_pictures     RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
ALTER TABLE inventario.t500_metadata     RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;

-- Schema data4n6 (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='data4n6' AND table_name='t100_person_links') THEN
        ALTER TABLE data4n6.t100_person_links RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='data4n6' AND table_name='t100_photos') THEN
        ALTER TABLE data4n6.t100_photos RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
    END IF;
END $$;
