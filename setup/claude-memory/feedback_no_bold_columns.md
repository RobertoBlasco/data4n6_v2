---
name: feedback-no-bold-columns
description: "Nunca usar negrita (font-medium, font-semibold, font-bold) en datos de columnas de tabla"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

No usar negrita en celdas de datos de tablas/rejillas. Las clases `font-medium`, `font-semibold` y `font-bold` están prohibidas en `<td>` a menos que el usuario lo pida explícitamente.

**Why:** El usuario lo indicó como directiva general para toda la aplicación.

**How to apply:** Al crear o modificar cualquier componente de rejilla, usar solo `text-xs` o `text-sm` sin modificadores de peso en las celdas de datos.
