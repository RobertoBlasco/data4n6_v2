CREATE TABLE inventario.t600_ordenes_contador (
    t200_eventos_id UUID     NOT NULL REFERENCES inventario.t200_eventos(t200_eventos_id),
    anio            SMALLINT NOT NULL,
    ultimo_numero   INTEGER  NOT NULL DEFAULT 0,
    PRIMARY KEY (t200_eventos_id, anio)
);
