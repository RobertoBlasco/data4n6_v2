-- Adds descripcion_estado to t300_eventos: a human-readable description of
-- where/to-whom the article belongs in the resulting state.
--
-- Rules:
--   Almacén    → "Almacén <warehouse_name>"  (from article's current warehouse)
--   Prestado   to agent → "Unidad <unit> Agente <callsign+name>"
--   Prestado   to unit  → "Unidad <unit>"
--   Adjudicado to agent → "Agente <callsign+name>"
--   Adjudicado to unit  → "Unidad <unit>"
--   All other states    → NULL

ALTER TABLE inventario.t300_eventos
    ADD COLUMN descripcion_estado VARCHAR(200);

-- Almacén: use the article's current warehouse
UPDATE inventario.t300_eventos ev
SET    descripcion_estado = 'Almacén ' || alm.name
FROM   inventario.t100_articulos art
JOIN   inventario.t100_almacenes alm ON alm.t100_almacenes_id = art.t100_almacenes_id
WHERE  ev.t100_articulos_id = art.t100_articulos_id
  AND  ev.estado_resultante  = 'Almacén'
  AND  alm.name IS NOT NULL
  AND  ev.deleted_at IS NULL;

-- Prestado → agent (show unit + agent)
UPDATE inventario.t300_eventos ev
SET    descripcion_estado =
           'Unidad ' || u.name
           || ' Agente ' || TRIM(CONCAT_WS(' ', NULLIF(ag.call_sign, ''), ag.first_name, ag.last_name))
FROM   inventario.t650_ordenes lo
JOIN   inventario.t600_ordenes_prestamo op ON op.t600_ordenes_id = lo.t600_ordenes_id
JOIN   common.t100_agents ag               ON ag.t100_agents_id  = op.adjudicatario_id
JOIN   common.t100_units  u                ON u.t100_units_id    = ag.t100_units_id
WHERE  ev.t650_ordenes_id  = lo.t650_ordenes_id
  AND  op.adjudicatario_tabla = 't100_agentes'
  AND  ev.estado_resultante   = 'Prestado'
  AND  ev.deleted_at IS NULL;

-- Prestado → unit (show unit only)
UPDATE inventario.t300_eventos ev
SET    descripcion_estado = 'Unidad ' || u.name
FROM   inventario.t650_ordenes lo
JOIN   inventario.t600_ordenes_prestamo op ON op.t600_ordenes_id = lo.t600_ordenes_id
JOIN   common.t100_units u                  ON u.t100_units_id   = op.adjudicatario_id
WHERE  ev.t650_ordenes_id  = lo.t650_ordenes_id
  AND  op.adjudicatario_tabla = 't100_unidades'
  AND  ev.estado_resultante   = 'Prestado'
  AND  ev.deleted_at IS NULL;

-- Adjudicado → agent
UPDATE inventario.t300_eventos ev
SET    descripcion_estado =
           'Agente ' || TRIM(CONCAT_WS(' ', NULLIF(ag.call_sign, ''), ag.first_name, ag.last_name))
FROM   inventario.t650_ordenes lo
JOIN   inventario.t600_ordenes_adjudicacion oa ON oa.t600_ordenes_id = lo.t600_ordenes_id
JOIN   common.t100_agents ag                    ON ag.t100_agents_id  = oa.adjudicatario_id
WHERE  ev.t650_ordenes_id  = lo.t650_ordenes_id
  AND  oa.adjudicatario_tabla = 't100_agentes'
  AND  ev.estado_resultante   = 'Adjudicado'
  AND  ev.deleted_at IS NULL;

-- Adjudicado → unit
UPDATE inventario.t300_eventos ev
SET    descripcion_estado = 'Unidad ' || u.name
FROM   inventario.t650_ordenes lo
JOIN   inventario.t600_ordenes_adjudicacion oa ON oa.t600_ordenes_id = lo.t600_ordenes_id
JOIN   common.t100_units u                      ON u.t100_units_id   = oa.adjudicatario_id
WHERE  ev.t650_ordenes_id  = lo.t650_ordenes_id
  AND  oa.adjudicatario_tabla = 't100_unidades'
  AND  ev.estado_resultante   = 'Adjudicado'
  AND  ev.deleted_at IS NULL;
