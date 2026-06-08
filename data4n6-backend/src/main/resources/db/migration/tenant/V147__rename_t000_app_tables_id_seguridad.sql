-- Rename PK column in t900_app_tables
ALTER TABLE seguridad.t900_app_tables
    RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;

-- Rename FK column in t900_table_fields
ALTER TABLE seguridad.t900_table_fields
    RENAME COLUMN t000_app_tables_id TO t900_app_tables_id;
