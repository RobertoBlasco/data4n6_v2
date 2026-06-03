-- Drop created_at from t600_ordenes; audit timestamp is stored in t500_metadata.

ALTER TABLE inventario.t600_ordenes
    DROP COLUMN created_at;
