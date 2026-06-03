-- Reimport PRS/DEV from tmp with current schema (V120/V121 renamed adjudicatario
-- to origen/destino split columns — V119 still used the old column names).
-- Also fixes step 13 descripcion_estado which referenced the now-deleted columns.

-- ── 1. Delete existing PRS/DEV import (reverse FK order) ─────────────────────

DELETE FROM inventario.t300_eventos
WHERE t300_eventos_id IN (
    SELECT lower(ev.t370_eventos_inventario_id)::uuid
    FROM tmp.t370_albaranes_agr_dev lin
    JOIN tmp.t370_eventos_inventario ev ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
);

DELETE FROM inventario.t300_eventos
WHERE t300_eventos_id IN (
    SELECT lower(ev.t370_eventos_inventario_id)::uuid
    FROM tmp.t370_albaranes_agr lin
    JOIN tmp.t370_eventos_inventario ev ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
);

DELETE FROM inventario.t650_ordenes_devolucion
WHERE t650_ordenes_id IN (SELECT lower(t370_albaranes_agr_dev_id)::uuid FROM tmp.t370_albaranes_agr_dev);

DELETE FROM inventario.t650_ordenes_prestamo
WHERE t650_ordenes_id IN (SELECT lower(t370_albaranes_agr_id)::uuid FROM tmp.t370_albaranes_agr);

DELETE FROM inventario.t650_ordenes
WHERE t650_ordenes_id IN (SELECT lower(t370_albaranes_agr_dev_id)::uuid FROM tmp.t370_albaranes_agr_dev);

DELETE FROM inventario.t650_ordenes
WHERE t650_ordenes_id IN (SELECT lower(t370_albaranes_agr_id)::uuid FROM tmp.t370_albaranes_agr);

DELETE FROM inventario.t600_ordenes_devolucion
WHERE t600_ordenes_id IN (SELECT lower(t700_albaranes_agr_dev_id)::uuid FROM tmp.t700_albaranes_agr_dev);

DELETE FROM inventario.t600_ordenes_prestamo
WHERE t600_ordenes_id IN (SELECT lower(t700_albaranes_agr_id)::uuid FROM tmp.t700_albaranes_agr);

DELETE FROM inventario.t600_ordenes
WHERE t600_ordenes_id IN (SELECT lower(t700_albaranes_agr_dev_id)::uuid FROM tmp.t700_albaranes_agr_dev);

DELETE FROM inventario.t600_ordenes
WHERE t600_ordenes_id IN (SELECT lower(t700_albaranes_agr_id)::uuid FROM tmp.t700_albaranes_agr);

-- ── 2. PRS order headers (suffix -N for duplicate referencias) ────────────────

INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en,
        fecha_inicio, fecha_fin)
SELECT lower(src.t700_albaranes_agr_id)::uuid,
       CASE WHEN src.rn = 1
            THEN src.referencia
            ELSE LEFT(src.referencia, 26) || '-' || src.rn::text
       END,
       '10000000-0000-0000-0000-000000000004',
       CASE WHEN src.esta_cerrado = 1
            THEN (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Completada')
            ELSE (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Pendiente')
       END,
       'Importación',
       COALESCE(src.fecha_inicio, src.fecha_fin, NOW()),
       src.fecha_inicio,
       src.fecha_fin
FROM (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY referencia
               ORDER BY (t100_casos_id IS NOT NULL) DESC,
                        fecha_inicio   DESC NULLS LAST,
                        t700_albaranes_agr_id
           ) AS rn
    FROM tmp.t700_albaranes_agr
) src
ON CONFLICT DO NOTHING;

-- ── 3. PRS header subtable — origen + destino (current schema) ────────────────

INSERT INTO inventario.t600_ordenes_prestamo
       (t600_ordenes_id,
        t100_agentes_origen_id,  t100_unidades_origen_id,
        t100_agentes_destino_id, t100_unidades_destino_id,
        fecha_devolucion, t100_casos_id)
SELECT lower(src.t700_albaranes_agr_id)::uuid,
       CASE WHEN src.t100_agentes_origen_id  IS NOT NULL THEN lower(src.t100_agentes_origen_id)::uuid  END,
       CASE WHEN src.t100_unidades_origen_id IS NOT NULL THEN lower(src.t100_unidades_origen_id)::uuid END,
       CASE WHEN src.t100_agentes_destino_id  IS NOT NULL THEN lower(src.t100_agentes_destino_id)::uuid  END,
       CASE WHEN src.t100_unidades_destino_id IS NOT NULL THEN lower(src.t100_unidades_destino_id)::uuid END,
       src.fecha_fin::date,
       CASE WHEN src.t100_casos_id IS NOT NULL THEN lower(src.t100_casos_id)::uuid END
FROM   tmp.t700_albaranes_agr src
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(src.t700_albaranes_agr_id)::uuid
WHERE  COALESCE(src.t100_agentes_destino_id, src.t100_unidades_destino_id) IS NOT NULL
ON CONFLICT DO NOTHING;

-- ── 4. PRS order lines ────────────────────────────────────────────────────────

INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
SELECT lower(lin.t370_albaranes_agr_id)::uuid,
       lower(lin.t700_albaranes_agr_id)::uuid,
       lower(lin.t700_inventario_id)::uuid
FROM   tmp.t370_albaranes_agr lin
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(lin.t700_albaranes_agr_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- ── 5. PRS line subtable ──────────────────────────────────────────────────────

INSERT INTO inventario.t650_ordenes_prestamo (t650_ordenes_id)
SELECT lower(lin.t370_albaranes_agr_id)::uuid
FROM   tmp.t370_albaranes_agr lin
JOIN   inventario.t650_ordenes lo ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_id)::uuid
ON CONFLICT DO NOTHING;

-- ── 6. DEV order headers ──────────────────────────────────────────────────────

INSERT INTO inventario.t600_ordenes
       (t600_ordenes_id, numero_referencia, t200_eventos_id,
        t200_estados_ordenes_id, aprobado_por, aprobado_en, fecha_fin)
SELECT lower(dev.t700_albaranes_agr_dev_id)::uuid,
       dev.referencia,
       '10000000-0000-0000-0000-000000000007',
       CASE WHEN dev.esta_cerrado = 1
            THEN (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Completada')
            ELSE (SELECT t200_estados_ordenes_id FROM inventario.t200_estados_ordenes WHERE nombre = 'Pendiente')
       END,
       'Importación',
       dev.fecha,
       dev.fecha
FROM   tmp.t700_albaranes_agr_dev dev
JOIN   inventario.t600_ordenes prs ON prs.t600_ordenes_id = lower(dev.t700_albaranes_agr_id)::uuid
ON CONFLICT DO NOTHING;

-- ── 7. DEV header subtable ────────────────────────────────────────────────────

INSERT INTO inventario.t600_ordenes_devolucion
       (t600_ordenes_id, t600_ordenes_prestamo_id)
SELECT lower(dev.t700_albaranes_agr_dev_id)::uuid,
       lower(dev.t700_albaranes_agr_id)::uuid
FROM   tmp.t700_albaranes_agr_dev dev
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(dev.t700_albaranes_agr_dev_id)::uuid
ON CONFLICT DO NOTHING;

-- ── 8. DEV order lines ────────────────────────────────────────────────────────

INSERT INTO inventario.t650_ordenes
       (t650_ordenes_id, t600_ordenes_id, t100_articulos_id)
SELECT lower(lin.t370_albaranes_agr_dev_id)::uuid,
       lower(lin.t700_albaranes_agr_dev_id)::uuid,
       lower(lin.t700_inventario_id)::uuid
FROM   tmp.t370_albaranes_agr_dev lin
JOIN   inventario.t600_ordenes o ON o.t600_ordenes_id = lower(lin.t700_albaranes_agr_dev_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- ── 9. DEV line subtable ──────────────────────────────────────────────────────

INSERT INTO inventario.t650_ordenes_devolucion
       (t650_ordenes_id, t650_ordenes_prestamo_id)
SELECT lower(lin.t370_albaranes_agr_dev_id)::uuid,
       lower(lin.t370_albaranes_agr_id)::uuid
FROM   tmp.t370_albaranes_agr_dev lin
JOIN   inventario.t650_ordenes lo ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_dev_id)::uuid
JOIN   inventario.t650_ordenes lp ON lp.t650_ordenes_id = lower(lin.t370_albaranes_agr_id)::uuid
ON CONFLICT (t650_ordenes_id) DO NOTHING;

-- ── 10. Event history for PRS lines ──────────────────────────────────────────

INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000004',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_agr_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio, NOW())
FROM   tmp.t370_albaranes_agr      lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t650_ordenes     lo  ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;

-- ── 11. Event history for DEV lines ──────────────────────────────────────────

INSERT INTO inventario.t300_eventos
       (t300_eventos_id, t200_eventos_id, t100_articulos_id,
        t650_ordenes_id, fecha_ini, fecha_fin, created_at)
SELECT lower(ev.t370_eventos_inventario_id)::uuid,
       '10000000-0000-0000-0000-000000000007',
       lower(ev.t700_inventario_id)::uuid,
       lower(lin.t370_albaranes_agr_dev_id)::uuid,
       ev.fecha_inicio,
       ev.fecha_fin,
       COALESCE(ev.fecha, ev.fecha_inicio, NOW())
FROM   tmp.t370_albaranes_agr_dev  lin
JOIN   tmp.t370_eventos_inventario ev  ON ev.t370_eventos_inventario_id = lin.t370_eventos_inventario_id
JOIN   inventario.t650_ordenes     lo  ON lo.t650_ordenes_id = lower(lin.t370_albaranes_agr_dev_id)::uuid
ON CONFLICT (t300_eventos_id) DO NOTHING;

-- ── 12. Recalculate estado_resultante ─────────────────────────────────────────

WITH RECURSIVE affected_articles AS (
    SELECT DISTINCT lower(t700_inventario_id)::uuid AS t100_articulos_id
    FROM tmp.t370_albaranes_agr
),
numbered AS (
    SELECT ev.t300_eventos_id, ev.t100_articulos_id, e.nombre AS evento_nombre,
           ROW_NUMBER() OVER (
               PARTITION BY ev.t100_articulos_id
               ORDER BY ev.created_at, ev.t300_eventos_id
           ) AS rn
    FROM inventario.t300_eventos ev
    JOIN inventario.t200_eventos  e  ON e.t200_eventos_id = ev.t200_eventos_id
    JOIN affected_articles        aa ON aa.t100_articulos_id = ev.t100_articulos_id
    WHERE ev.deleted_at IS NULL
),
state_chain AS (
    SELECT n.t300_eventos_id, n.t100_articulos_id, n.rn,
           CASE n.evento_nombre
               WHEN 'Entrada Almacén'         THEN 'Almacén'
               WHEN 'Traspaso Almacén'        THEN 'Almacén'
               WHEN 'Fin de Reparación'       THEN 'Almacén'
               WHEN 'Préstamo'                THEN 'Prestado'
               WHEN 'Adjudicación'            THEN 'Adjudicado'
               WHEN 'Baja'                    THEN 'Baja'
               WHEN 'Reparación'              THEN 'En reparación'
               ELSE 'Almacén'
           END::TEXT AS estado_resultante,
           NULL::TEXT AS restore_state
    FROM numbered n WHERE n.rn = 1

    UNION ALL

    SELECT n.t300_eventos_id, n.t100_articulos_id, n.rn,
           CASE n.evento_nombre
               WHEN 'Entrada Almacén'         THEN 'Almacén'
               WHEN 'Traspaso Almacén'        THEN 'Almacén'
               WHEN 'Fin de Reparación'       THEN 'Almacén'
               WHEN 'Préstamo'                THEN 'Prestado'
               WHEN 'Adjudicación'            THEN 'Adjudicado'
               WHEN 'Baja'                    THEN 'Baja'
               WHEN 'Reparación'              THEN 'En reparación'
               WHEN 'Devolución Préstamo'     THEN COALESCE(sc.restore_state, 'Almacén')
               WHEN 'Devolución Adjudicación' THEN COALESCE(sc.restore_state, 'Almacén')
               ELSE sc.estado_resultante
           END::TEXT AS estado_resultante,
           CASE n.evento_nombre
               WHEN 'Préstamo'                THEN sc.estado_resultante
               WHEN 'Adjudicación'            THEN sc.estado_resultante
               WHEN 'Devolución Préstamo'     THEN NULL
               WHEN 'Devolución Adjudicación' THEN NULL
               ELSE sc.restore_state
           END::TEXT AS restore_state
    FROM state_chain sc
    JOIN numbered n ON n.t100_articulos_id = sc.t100_articulos_id AND n.rn = sc.rn + 1
)
UPDATE inventario.t300_eventos ev
SET    estado_resultante = sc.estado_resultante
FROM   state_chain sc
WHERE  ev.t300_eventos_id = sc.t300_eventos_id;

-- ── 13. Recalculate descripcion_estado (uses new origen/destino columns) ──────

-- Almacén
UPDATE inventario.t300_eventos ev
SET    descripcion_estado = 'Almacén ' || alm.name
FROM   inventario.t100_articulos art
JOIN   inventario.t100_almacenes alm ON alm.t100_almacenes_id = art.t100_almacenes_id
WHERE  ev.t100_articulos_id = art.t100_articulos_id
  AND  ev.t100_articulos_id IN (SELECT lower(t700_inventario_id)::uuid FROM tmp.t370_albaranes_agr)
  AND  ev.estado_resultante  = 'Almacén'
  AND  alm.name IS NOT NULL
  AND  ev.deleted_at IS NULL;

-- Prestado a agente (destino)
UPDATE inventario.t300_eventos ev
SET    descripcion_estado =
           'Unidad ' || u.name
           || ' Agente ' || TRIM(CONCAT_WS(' ', NULLIF(ag.call_sign, ''), ag.first_name, ag.last_name))
FROM   inventario.t650_ordenes lo
JOIN   inventario.t600_ordenes_prestamo op ON op.t600_ordenes_id = lo.t600_ordenes_id
JOIN   common.t100_agents ag               ON ag.t100_agents_id  = op.t100_agentes_destino_id
LEFT JOIN common.t100_units  u             ON u.t100_units_id    = ag.t100_units_id
WHERE  ev.t650_ordenes_id   = lo.t650_ordenes_id
  AND  ev.t100_articulos_id IN (SELECT lower(t700_inventario_id)::uuid FROM tmp.t370_albaranes_agr)
  AND  op.t100_agentes_destino_id IS NOT NULL
  AND  ev.estado_resultante = 'Prestado'
  AND  ev.deleted_at IS NULL;

-- Prestado a unidad (destino)
UPDATE inventario.t300_eventos ev
SET    descripcion_estado = 'Unidad ' || u.name
FROM   inventario.t650_ordenes lo
JOIN   inventario.t600_ordenes_prestamo op ON op.t600_ordenes_id = lo.t600_ordenes_id
JOIN   common.t100_units u                  ON u.t100_units_id   = op.t100_unidades_destino_id
WHERE  ev.t650_ordenes_id   = lo.t650_ordenes_id
  AND  ev.t100_articulos_id IN (SELECT lower(t700_inventario_id)::uuid FROM tmp.t370_albaranes_agr)
  AND  op.t100_unidades_destino_id IS NOT NULL
  AND  op.t100_agentes_destino_id  IS NULL
  AND  ev.estado_resultante = 'Prestado'
  AND  ev.deleted_at IS NULL;
