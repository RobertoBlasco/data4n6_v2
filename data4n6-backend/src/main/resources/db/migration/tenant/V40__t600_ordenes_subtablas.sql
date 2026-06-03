-- Specialization subtables for t600_ordenes (one row per order, same PK).
-- Each table extends the base order with fields specific to that operation type.

-- ENT: warehouse-entry orders
-- proveedor_id/proveedor_tabla are polymorphic placeholders, replaced by proper FK in V42.
CREATE TABLE inventario.t600_ordenes_entrada (
    t600_ordenes_id           UUID  NOT NULL PRIMARY KEY
                                    REFERENCES inventario.t600_ordenes(t600_ordenes_id),
    t200_entradas_almacen_id  UUID  NOT NULL
                                    REFERENCES inventario.t200_entradas_almacen(t200_entradas_almacen_id),
    proveedor_id              UUID,
    proveedor_tabla           VARCHAR(100)
);

CREATE INDEX idx_t600_ent_tipo_entrada  ON inventario.t600_ordenes_entrada(t200_entradas_almacen_id);
CREATE INDEX idx_t600_ent_proveedor     ON inventario.t600_ordenes_entrada(proveedor_id);

-- TRS: warehouse-transfer orders
-- All lines in a transfer come from the same source warehouse.
CREATE TABLE inventario.t600_ordenes_traspaso (
    t600_ordenes_id           UUID  NOT NULL PRIMARY KEY
                                    REFERENCES inventario.t600_ordenes(t600_ordenes_id),
    t100_almacenes_origen_id  UUID  NOT NULL
                                    REFERENCES inventario.t100_almacenes(t100_almacenes_id)
);

CREATE INDEX idx_t600_trs_almacen_origen ON inventario.t600_ordenes_traspaso(t100_almacenes_origen_id);

-- ADJ: adjudication orders — permanent assignment to a recipient unit/person.
-- adjudicatario is polymorphic; all lines go to the same recipient.
CREATE TABLE inventario.t600_ordenes_adjudicacion (
    t600_ordenes_id     UUID         NOT NULL PRIMARY KEY
                                     REFERENCES inventario.t600_ordenes(t600_ordenes_id),
    adjudicatario_id    UUID         NOT NULL,
    adjudicatario_tabla VARCHAR(100) NOT NULL
);

CREATE INDEX idx_t600_adj_adjudicatario ON inventario.t600_ordenes_adjudicacion(adjudicatario_id);

-- PRS: loan orders — temporary assignment with an expected return date.
-- adjudicatario is polymorphic; all lines go to the same borrower.
CREATE TABLE inventario.t600_ordenes_prestamo (
    t600_ordenes_id     UUID         NOT NULL PRIMARY KEY
                                     REFERENCES inventario.t600_ordenes(t600_ordenes_id),
    adjudicatario_id    UUID         NOT NULL,
    adjudicatario_tabla VARCHAR(100) NOT NULL,
    fecha_devolucion    DATE
);

CREATE INDEX idx_t600_prs_adjudicatario ON inventario.t600_ordenes_prestamo(adjudicatario_id);
