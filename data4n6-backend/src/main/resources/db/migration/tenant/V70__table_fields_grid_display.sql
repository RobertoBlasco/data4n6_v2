ALTER TABLE common.t900_table_fields
    ADD COLUMN IF NOT EXISTS grid_width SMALLINT,
    ADD COLUMN IF NOT EXISTS grid_align VARCHAR(10);

-- active already rendered as icon column — hide as data column
UPDATE common.t900_table_fields
SET visible_in_grid = false
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
)
AND field_name = 'active';

-- callSign: narrow and centered
UPDATE common.t900_table_fields
SET grid_width = 120, grid_align = 'center'
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
)
AND field_name = 'callSign';
