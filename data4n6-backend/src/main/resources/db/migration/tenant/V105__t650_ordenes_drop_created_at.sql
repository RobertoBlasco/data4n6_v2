-- Drop created_at from t650_ordenes; audit timestamp is stored in t500_metadata.

ALTER TABLE inventario.t650_ordenes
    DROP COLUMN created_at;
