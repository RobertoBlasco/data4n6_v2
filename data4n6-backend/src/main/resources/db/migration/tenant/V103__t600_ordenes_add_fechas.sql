-- Add start/end dates to orders, independent of the audit created_at timestamp.
-- fecha_inicio: set when status transitions to "En proceso"
-- fecha_fin:    set when status transitions to "Completada" or "Anulada"

ALTER TABLE inventario.t600_ordenes
    ADD COLUMN fecha_inicio TIMESTAMPTZ,
    ADD COLUMN fecha_fin    TIMESTAMPTZ;
