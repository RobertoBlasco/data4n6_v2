-- Drop the polymorphic proveedor_id/proveedor_tabla columns from t600_ordenes_entrada.
-- t200_proveedores_id FK was already added by V41; PostgreSQL drops the dependent
-- idx_t600_ent_proveedor index on proveedor_id automatically.

ALTER TABLE inventario.t600_ordenes_entrada
    DROP COLUMN proveedor_id,
    DROP COLUMN proveedor_tabla;

CREATE INDEX idx_t600_ent_proveedor ON inventario.t600_ordenes_entrada(t200_proveedores_id);
