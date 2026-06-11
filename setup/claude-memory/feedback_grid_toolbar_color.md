---
name: feedback-grid-toolbar-color
description: "Color de toolbar de rejillas: usar bg-[#005a3b] text-white, nunca bg-primary"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Usar siempre `bg-[#005a3b] text-white` para el toolbar (cabecera) de las rejillas. **No usar `bg-primary`**.

**Why:** `bg-primary` usa `var(--primary)` que estaba definido como `oklch(0.41 0.093 163)`. Si el navegador no soporta `oklch`, la variable resulta inválida y Angular Material pone un gris (#737373) de fondo. El hex explícito funciona en cualquier navegador.

**How to apply:** En `GridBase.toolbarColor` y en cualquier plantilla de rejilla que defina el color del toolbar directamente, usar siempre el hex `#005a3b`. La variable CSS `--primary` en `styles.css` también se ha cambiado a `#005a3b` para que `bg-primary`, `text-primary` y `border-primary` sigan funcionando en el resto de la app.
