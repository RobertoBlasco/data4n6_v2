-- t200_proveedores: suppliers catalog
-- Companies or individuals that provide items to the inventory.

INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t200_proveedores', 'Proveedores', 'Catálogo de proveedores de artículos de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t200_proveedores (
    t200_proveedores_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre               VARCHAR(200) NOT NULL,
    nif                  VARCHAR(20),
    contacto             VARCHAR(150),
    telefono             VARCHAR(30),
    email                VARCHAR(150),
    direccion            TEXT,
    notas                TEXT,
    deleted_at           TIMESTAMPTZ,
    CONSTRAINT t200_proveedores_nombre_uq UNIQUE (nombre)
);

CREATE INDEX t200_proveedores_nombre_like ON inventario.t200_proveedores USING btree (nombre varchar_pattern_ops);

-- Add provider FK to the entry-order subtable.
-- The index on t200_proveedores_id is created in V42 after the old idx_t600_ent_proveedor
-- (on proveedor_id) is dropped automatically by DROP COLUMN.
ALTER TABLE inventario.t600_ordenes_entrada
    ADD COLUMN t200_proveedores_id UUID REFERENCES inventario.t200_proveedores(t200_proveedores_id);
