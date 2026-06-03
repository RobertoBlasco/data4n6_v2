-- Add estado_resultante to t300_eventos: the state the article ends up in after each event.
-- For most events this is a static mapping; for Devolución Préstamo / Devolución Adjudicación
-- it restores the state that was in effect before the corresponding Préstamo / Adjudicación.
-- Computed via a forward-propagating recursive CTE that carries a restore_state stack entry.

ALTER TABLE inventario.t300_eventos
    ADD COLUMN estado_resultante VARCHAR(100);

WITH RECURSIVE numbered AS (
    SELECT
        ev.t300_eventos_id,
        ev.t100_articulos_id,
        e.nombre AS evento_nombre,
        ROW_NUMBER() OVER (
            PARTITION BY ev.t100_articulos_id
            ORDER BY ev.created_at, ev.t300_eventos_id
        ) AS rn
    FROM inventario.t300_eventos ev
    JOIN inventario.t200_eventos   e ON e.t200_eventos_id = ev.t200_eventos_id
    WHERE ev.deleted_at IS NULL
),
state_chain AS (
    -- Base: first event per article
    SELECT
        n.t300_eventos_id,
        n.t100_articulos_id,
        n.rn,
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
    FROM numbered n
    WHERE n.rn = 1

    UNION ALL

    -- Recursive: propagate state forward
    SELECT
        n.t300_eventos_id,
        n.t100_articulos_id,
        n.rn,
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
        -- Save current state before entering Préstamo/Adjudicación; clear it on Devolución
        CASE n.evento_nombre
            WHEN 'Préstamo'                THEN sc.estado_resultante
            WHEN 'Adjudicación'            THEN sc.estado_resultante
            WHEN 'Devolución Préstamo'     THEN NULL
            WHEN 'Devolución Adjudicación' THEN NULL
            ELSE sc.restore_state
        END::TEXT AS restore_state
    FROM state_chain sc
    JOIN numbered n
      ON n.t100_articulos_id = sc.t100_articulos_id
     AND n.rn = sc.rn + 1
)
UPDATE inventario.t300_eventos ev
SET    estado_resultante = sc.estado_resultante
FROM   state_chain sc
WHERE  ev.t300_eventos_id = sc.t300_eventos_id;
