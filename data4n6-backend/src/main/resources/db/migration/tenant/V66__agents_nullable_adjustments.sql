-- last_name optional, t100_units_id required
ALTER TABLE common.t100_agents ALTER COLUMN last_name   DROP NOT NULL;
ALTER TABLE common.t100_agents ALTER COLUMN t100_units_id SET NOT NULL;

UPDATE common.t900_table_fields
SET required = false
WHERE field_name = 'lastName'
  AND t000_app_tables_id = (
      SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
  );

UPDATE common.t900_table_fields
SET required = true
WHERE field_name = 'unitId'
  AND t000_app_tables_id = (
      SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
  );
