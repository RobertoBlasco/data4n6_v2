-- Populate t250_eventos with allowed event transitions.
-- Uses event names (subqueries) so it's UUID-independent.
-- Transitions are grouped by the estado_resultante that the origin event produces.

-- ── Desde "Almacén" (ENT, TRS, Fin Reparación, DEV Préstamo, DEV Adjudicación) ──
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
SELECT e1.t200_eventos_id, e2.t200_eventos_id
FROM   inventario.t200_eventos e1
CROSS JOIN inventario.t200_eventos e2
WHERE  e1.nombre IN (
           'Entrada Almacén', 'Traspaso Almacén', 'Fin de Reparación',
           'Devolución Préstamo', 'Devolución Adjudicación'
       )
  AND  e2.nombre IN ('Préstamo', 'Traspaso Almacén', 'Baja', 'Adjudicación', 'Reparación')
ON CONFLICT DO NOTHING;

-- ── Desde "Prestado" (Préstamo) ───────────────────────────────────────────────
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
SELECT e1.t200_eventos_id, e2.t200_eventos_id
FROM   inventario.t200_eventos e1
CROSS JOIN inventario.t200_eventos e2
WHERE  e1.nombre = 'Préstamo'
  AND  e2.nombre = 'Devolución Préstamo'
ON CONFLICT DO NOTHING;

-- ── Desde "Adjudicado" (Adjudicación) — puede prestarse aunque siga adjudicado ─
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
SELECT e1.t200_eventos_id, e2.t200_eventos_id
FROM   inventario.t200_eventos e1
CROSS JOIN inventario.t200_eventos e2
WHERE  e1.nombre = 'Adjudicación'
  AND  e2.nombre IN ('Préstamo', 'Devolución Adjudicación')
ON CONFLICT DO NOTHING;

-- ── Desde "En reparación" (Reparación) ───────────────────────────────────────
INSERT INTO inventario.t250_eventos (t200_eventos_origen_id, t200_eventos_destino_id)
SELECT e1.t200_eventos_id, e2.t200_eventos_id
FROM   inventario.t200_eventos e1
CROSS JOIN inventario.t200_eventos e2
WHERE  e1.nombre = 'Reparación'
  AND  e2.nombre = 'Fin de Reparación'
ON CONFLICT DO NOTHING;

-- "Baja" tiene 0 transiciones — no se inserta nada.
