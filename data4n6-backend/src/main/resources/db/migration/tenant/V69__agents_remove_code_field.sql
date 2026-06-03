DELETE FROM common.t900_table_fields
WHERE t000_app_tables_id = (
    SELECT t000_app_tables_id FROM common.t000_app_tables WHERE table_name = 't100_agents'
)
AND field_name = 'code';
