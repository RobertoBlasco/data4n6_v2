-- Link loan orders to an investigation case.
-- Nullable: existing orders pre-date this field; new loans should always set it.
ALTER TABLE inventario.t600_ordenes_prestamo
    ADD COLUMN t100_casos_id UUID REFERENCES data4n6.t100_cases(t100_cases_id);

CREATE INDEX idx_t600_prs_caso ON inventario.t600_ordenes_prestamo(t100_casos_id);
