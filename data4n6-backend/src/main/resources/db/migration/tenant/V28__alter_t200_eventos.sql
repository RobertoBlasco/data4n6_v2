ALTER TABLE inventario.t200_eventos
    DROP COLUMN "default",
    DROP COLUMN accion_activo;

ALTER TABLE inventario.t200_eventos
    RENAME COLUMN codigo_ref TO descripcion_corta;
