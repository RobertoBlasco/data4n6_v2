-- Remove almacen_origen from transfer order header.
-- Origin warehouse is tracked per line in t650_ordenes_traspaso, not at header level.

ALTER TABLE inventario.t600_ordenes_traspaso
    DROP CONSTRAINT IF EXISTS idx_t600_trs_almacen_origen;

DROP INDEX IF EXISTS inventario.idx_t600_trs_almacen_origen;

ALTER TABLE inventario.t600_ordenes_traspaso
    DROP COLUMN t100_almacenes_origen_id;
