INSERT INTO common.t000_app_tables (table_name, display_name, description)
VALUES ('t250_eventos', 'Transiciones de evento', 'Relaciones de sucesión entre tipos de evento de inventario')
ON CONFLICT (table_name) DO NOTHING;

CREATE TABLE inventario.t250_eventos (
    t250_eventos_id          UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    t200_eventos_origen_id   UUID NOT NULL REFERENCES inventario.t200_eventos(t200_eventos_id),
    t200_eventos_destinos_id UUID NOT NULL REFERENCES inventario.t200_eventos(t200_eventos_id),
    CONSTRAINT t250_eventos_uq UNIQUE (t200_eventos_origen_id, t200_eventos_destinos_id)
);

CREATE INDEX idx_t250_eventos_origen   ON inventario.t250_eventos(t200_eventos_origen_id);
CREATE INDEX idx_t250_eventos_destino  ON inventario.t250_eventos(t200_eventos_destinos_id);
