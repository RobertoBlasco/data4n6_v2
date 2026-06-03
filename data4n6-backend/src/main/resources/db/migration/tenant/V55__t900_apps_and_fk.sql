-- Create applications registry and convert t000_app_tables.application string to FK.

CREATE TABLE IF NOT EXISTS common.t900_apps (
    t900_apps_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(50)  NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description  TEXT,
    icono        VARCHAR(100)
);

INSERT INTO common.t900_apps (name, display_name) VALUES
    ('common',    'Común'),
    ('inventory', 'Inventario'),
    ('data4n6',   'Forense')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE common.t000_app_tables
    ADD COLUMN IF NOT EXISTS t900_apps_id UUID REFERENCES common.t900_apps(t900_apps_id);

UPDATE common.t000_app_tables t
SET t900_apps_id = a.t900_apps_id
FROM common.t900_apps a
WHERE t.application = a.name
  AND t.t900_apps_id IS NULL;

ALTER TABLE common.t000_app_tables
    DROP COLUMN IF EXISTS application;

-- Update form_fields to reference the FK endpoint
UPDATE common.t000_app_tables
SET form_fields = 'displayName,nombreSingular,nombrePlural,icono,endpointBase,seccionMenu,ordenMenu,vistas,formFields,dbSchema,application:/catalog/apps'
WHERE table_name = 't000_app_tables';
