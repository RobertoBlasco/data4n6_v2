-- Make agent code optional in both the table constraint and the form metadata

ALTER TABLE common.t100_agents ALTER COLUMN code DROP NOT NULL;

UPDATE common.t900_table_fields
SET required = false
WHERE field_name = 'code'
  AND t000_app_tables_id = (
      SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
  );
