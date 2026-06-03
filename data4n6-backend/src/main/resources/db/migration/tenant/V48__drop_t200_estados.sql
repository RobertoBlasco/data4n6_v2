ALTER TABLE inventario.t200_eventos
    DROP COLUMN t200_estados_id;

ALTER TABLE inventario.t300_eventos
    DROP COLUMN t200_estados_anterior_id,
    DROP COLUMN t200_estados_nuevo_id;

ALTER TABLE inventario.t400_materiales_activos
    DROP COLUMN t200_estados_id;

ALTER TABLE inventario.t100_articulos
    DROP COLUMN t200_estados_id;

ALTER TABLE inventario.t400_lineas_propuesta
    DROP COLUMN t200_estados_id;

DELETE FROM common.t000_app_tables WHERE table_name = 't200_estados';

DROP TABLE inventario.t200_estados;
