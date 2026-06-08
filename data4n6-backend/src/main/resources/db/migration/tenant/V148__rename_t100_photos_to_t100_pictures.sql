-- Rename t100_photos → t100_pictures

ALTER TABLE inventario.t100_photos RENAME TO t100_pictures;
ALTER TABLE inventario.t100_pictures RENAME COLUMN t100_photos_id TO t100_pictures_id;

-- Rename indexes
DROP INDEX IF EXISTS inventario.idx_t100_photos_entity;
DROP INDEX IF EXISTS inventario.idx_t100_photos_deleted_at;

CREATE INDEX idx_t100_pictures_entity     ON inventario.t100_pictures (t900_app_tables_id, record_id);
CREATE INDEX idx_t100_pictures_deleted_at ON inventario.t100_pictures (deleted_at);

-- Update app_tables registry if it exists
UPDATE seguridad.t900_app_tables
SET table_name      = 't100_pictures',
    display_name    = 'Imágenes',
    nombre_singular = 'Imagen',
    nombre_plural   = 'Imágenes'
WHERE table_name = 't100_photos';
