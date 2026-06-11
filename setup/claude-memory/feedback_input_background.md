---
name: feedback-input-background
description: "Estilo de campos editables: bg-surface-primary + border-border + text-[#005a3b]"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Todos los campos de formulario editables deben tener:
- Fondo `bg-surface-primary` (verde muy suave — igual que las filas zebra de las rejillas)
- Borde `border-border` (gris claro — igual que los bordes de las rejillas)
- Color de fuente `text-[#005a3b]` — el mismo verde del header/toolbar

**Why:** Coherencia visual con las rejillas y con el color corporativo verde. El texto verde en campos editables refuerza la identidad visual de la app.

**How to apply:**
- Está definido globalmente en `src/app/spartan/input/src/lib/hlm-input.ts` y en `FkComboboxComponent` — se aplica automáticamente sin añadir clases.
- Date pickers e inputs de fecha hardcodeados: añadir `bg-surface-primary border-border text-[#005a3b]` manualmente.
- Excluir: checkboxes, divs de solo lectura, inputs de paginación.
