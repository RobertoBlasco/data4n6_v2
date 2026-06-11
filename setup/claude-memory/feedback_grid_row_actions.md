---
name: feedback-grid-row-actions
description: "Patrón de acciones en rejillas — sin botones en filas, acciones en header al seleccionar"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e296a401-c718-4c85-83c2-a6ca632366ed
---

No poner botones de acción (editar, eliminar) en las filas de las rejillas.

**Why:** El usuario quiere el patrón de la rejilla de órdenes de préstamo: las acciones aparecen en el header cuando hay elementos seleccionados.

**How to apply:**
- Las filas solo llevan checkbox de selección
- Cuando `selectionCount() === 0`: header normal con título y botón de alta
- Cuando `selectionCount() > 0`: header muestra "X seleccionado(s)" + botones en este orden exacto:
  1. **Eliminar** (`lucideTrash2`, `text-destructive`) — siempre
  2. **Ir formulario** (`lucideExternalLink`) — solo si `selectionCount() === 1`
  3. **Exportar** (`lucideDownload`) — siempre
  4. Divisor `border-r`
  5. **✕ Deseleccionar** (`lucideX`, `size="icon"`) — siempre
- Nunca añadir columna "Acciones" en el thead ni botones en las celdas td
