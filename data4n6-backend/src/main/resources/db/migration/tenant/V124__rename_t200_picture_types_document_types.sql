-- Rename type tables: _types suffix is redundant, t200_ prefix already implies type/category

-- ── 1. Rename tables ────────────────────────────────────────────────────────

ALTER TABLE common.t200_picture_types  RENAME TO t200_pictures;
ALTER TABLE common.t200_document_types RENAME TO t200_documents;

-- ── 2. Rename PK columns ────────────────────────────────────────────────────

ALTER TABLE common.t200_pictures  RENAME COLUMN t200_picture_types_id  TO t200_pictures_id;
ALTER TABLE common.t200_documents RENAME COLUMN t200_document_types_id TO t200_documents_id;

-- ── 3. Rename FK columns in attachment tables ────────────────────────────────

ALTER TABLE inventario.t300_pictures  RENAME COLUMN t200_picture_types_id  TO t200_pictures_id;
ALTER TABLE inventario.t300_documents RENAME COLUMN t200_document_types_id TO t200_documents_id;

-- ── 4. Update t000_app_tables ────────────────────────────────────────────────

UPDATE common.t000_app_tables SET table_name = 't200_pictures'
WHERE table_name = 't200_picture_types';

UPDATE common.t000_app_tables SET table_name = 't200_documents'
WHERE table_name = 't200_document_types';
