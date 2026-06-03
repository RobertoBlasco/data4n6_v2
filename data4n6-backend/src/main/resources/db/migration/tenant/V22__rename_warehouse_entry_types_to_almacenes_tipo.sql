-- Rename t200_warehouse_entry_types → t200_almacenes (tipo de almacén catalog)
ALTER TABLE inventario.t200_warehouse_entry_types RENAME TO t200_almacenes;
ALTER TABLE inventario.t200_almacenes RENAME COLUMN t200_warehouse_entry_types_id TO t200_almacenes_id;

UPDATE common.t000_app_tables
SET table_name   = 't200_almacenes',
    display_name = 'Tipos de almacén',
    description  = 'Catálogo de tipos de almacén'
WHERE table_name = 't200_warehouse_entry_types';

-- Add tipo FK to t100_almacenes
ALTER TABLE inventario.t100_almacenes
    ADD COLUMN t200_almacenes_id UUID REFERENCES inventario.t200_almacenes(t200_almacenes_id);

CREATE INDEX idx_t100_almacenes_tipo ON inventario.t100_almacenes(t200_almacenes_id);
