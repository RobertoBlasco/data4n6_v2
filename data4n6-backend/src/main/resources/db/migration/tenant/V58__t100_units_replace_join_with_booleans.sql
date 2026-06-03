-- Replace t300_units join table with two boolean columns on t100_units.
-- Both false = universal (visible in all modules).

ALTER TABLE common.t100_units
    ADD COLUMN IF NOT EXISTS for_inventory BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS for_data4n6   BOOLEAN NOT NULL DEFAULT false;

-- Migrate any existing rows from t300_units
UPDATE common.t100_units u
SET for_inventory = true
WHERE EXISTS (
    SELECT 1 FROM common.t300_units j
    JOIN common.t900_apps a ON a.t900_apps_id = j.t900_apps_id
    WHERE j.t100_units_id = u.t100_units_id AND a.name = 'inventory'
);

UPDATE common.t100_units u
SET for_data4n6 = true
WHERE EXISTS (
    SELECT 1 FROM common.t300_units j
    JOIN common.t900_apps a ON a.t900_apps_id = j.t900_apps_id
    WHERE j.t100_units_id = u.t100_units_id AND a.name = 'data4n6'
);

DROP TABLE IF EXISTS common.t300_units;
