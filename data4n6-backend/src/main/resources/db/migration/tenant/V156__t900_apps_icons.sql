-- Add icons to t900_apps for application module identification

UPDATE seguridad.t900_apps
SET icono = 'lucideBoxes'
WHERE name = 'inventory';

UPDATE seguridad.t900_apps
SET icono = 'lucideFlaskConical'
WHERE name = 'data4n6';

UPDATE seguridad.t900_apps
SET icono = 'lucideSettings'
WHERE name = 'common';
