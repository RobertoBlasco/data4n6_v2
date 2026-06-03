ALTER TABLE inventario.t300_pictures
    ADD COLUMN es_principal BOOLEAN NOT NULL DEFAULT false;

-- At most one principal picture per entity record + picture type (excluding soft-deleted rows)
CREATE UNIQUE INDEX uq_t300_pictures_principal
    ON inventario.t300_pictures (record_id, t200_pictures_id)
    WHERE es_principal = true AND deleted_at IS NULL;
