ALTER TABLE common.t000_app_tables ADD COLUMN IF NOT EXISTS form_route VARCHAR(200);

UPDATE common.t000_app_tables
SET form_route = '/common/agents'
WHERE table_name = 't100_agents';
