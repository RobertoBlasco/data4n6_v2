-- Drop FK constraints from inventario tables pointing to common.t000_app_tables
ALTER TABLE inventario.t300_docs      DROP CONSTRAINT t300_docs_t000_app_tables_id_fkey;
ALTER TABLE inventario.t300_documents DROP CONSTRAINT t300_documents_t000_app_tables_id_fkey;
ALTER TABLE inventario.t300_notes     DROP CONSTRAINT t300_notes_t000_app_tables_id_fkey;
ALTER TABLE inventario.t300_pictures  DROP CONSTRAINT t300_pictures_t000_app_tables_id_fkey;
ALTER TABLE inventario.t500_metadata  DROP CONSTRAINT t500_metadata_t000_app_tables_fk;

-- Move to seguridad schema and rename
ALTER TABLE common.t000_app_tables SET SCHEMA seguridad;
ALTER TABLE seguridad.t000_app_tables RENAME TO t900_app_tables;

-- Recreate FK constraints pointing to the new table
ALTER TABLE inventario.t300_docs
    ADD CONSTRAINT t300_docs_t900_app_tables_id_fkey
    FOREIGN KEY (t000_app_tables_id) REFERENCES seguridad.t900_app_tables(t000_app_tables_id);

ALTER TABLE inventario.t300_documents
    ADD CONSTRAINT t300_documents_t900_app_tables_id_fkey
    FOREIGN KEY (t000_app_tables_id) REFERENCES seguridad.t900_app_tables(t000_app_tables_id);

ALTER TABLE inventario.t300_notes
    ADD CONSTRAINT t300_notes_t900_app_tables_id_fkey
    FOREIGN KEY (t000_app_tables_id) REFERENCES seguridad.t900_app_tables(t000_app_tables_id);

ALTER TABLE inventario.t300_pictures
    ADD CONSTRAINT t300_pictures_t900_app_tables_id_fkey
    FOREIGN KEY (t000_app_tables_id) REFERENCES seguridad.t900_app_tables(t000_app_tables_id);

ALTER TABLE inventario.t500_metadata
    ADD CONSTRAINT t500_metadata_t900_app_tables_fk
    FOREIGN KEY (t000_app_tables_id) REFERENCES seguridad.t900_app_tables(t000_app_tables_id);
