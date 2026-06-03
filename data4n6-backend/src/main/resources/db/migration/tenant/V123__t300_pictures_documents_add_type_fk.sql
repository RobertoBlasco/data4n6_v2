-- Add type FK to polymorphic attachment tables

ALTER TABLE inventario.t300_pictures
    ADD COLUMN t200_picture_types_id UUID
        REFERENCES common.t200_picture_types(t200_picture_types_id);

ALTER TABLE inventario.t300_documents
    ADD COLUMN t200_document_types_id UUID
        REFERENCES common.t200_document_types(t200_document_types_id);
