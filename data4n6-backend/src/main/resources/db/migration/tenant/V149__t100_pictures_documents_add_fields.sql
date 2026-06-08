-- Add picture-type FK, es_principal and caption to t100_pictures
ALTER TABLE inventario.t100_pictures
    ADD COLUMN t200_pictures_id UUID    REFERENCES common.t200_pictures(t200_pictures_id),
    ADD COLUMN es_principal     BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN caption          TEXT;

-- Add document-type FK to t100_documents
ALTER TABLE inventario.t100_documents
    ADD COLUMN t200_documents_id UUID REFERENCES common.t200_documents(t200_documents_id);
