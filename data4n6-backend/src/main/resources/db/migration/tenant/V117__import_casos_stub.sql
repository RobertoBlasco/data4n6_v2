-- Insert stub cases into data4n6.t100_cases from the distinct case UUIDs
-- referenced in tmp.t700_albaranes_agr (historical loan orders).
-- reference and code columns were handled in V115/V116; only data insertion here.
-- The original UUIDs are preserved as PKs so FK references remain valid in V118.

INSERT INTO data4n6.t100_cases
    (t100_cases_id, title, created_by, updated_by)
SELECT
    lower(src.t100_casos_id)::uuid,
    'Caso importado (pendiente de actualizar)',
    'import',
    'import'
FROM (
    SELECT DISTINCT t100_casos_id
    FROM tmp.t700_albaranes_agr
    WHERE t100_casos_id IS NOT NULL
) src
ON CONFLICT (t100_cases_id) DO NOTHING;
