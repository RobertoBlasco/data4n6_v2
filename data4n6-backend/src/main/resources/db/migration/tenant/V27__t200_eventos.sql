INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t200_eventos', 'Eventos de inventario', 'Catálogo de tipos de eventos de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t200_eventos (
    t200_eventos_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre           VARCHAR(200) NOT NULL,
    codigo_ref       VARCHAR(10),
    descripcion      TEXT         NOT NULL,
    "default"        SMALLINT     NOT NULL,
    accion_activo    VARCHAR(30)  NOT NULL,
    t200_estados_id  UUID         REFERENCES inventario.t200_estados(t200_estados_id),
    CONSTRAINT t200_eventos_nombre_key UNIQUE (nombre)
);

CREATE INDEX t200_eventos_nombre_abb0f237_like ON inventario.t200_eventos USING btree (nombre varchar_pattern_ops);
CREATE INDEX idx_t200_eventos_estado ON inventario.t200_eventos(t200_estados_id);
