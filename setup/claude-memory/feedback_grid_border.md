---
name: feedback-grid-border
description: Las rejillas principales llevan border-2 border-primary en su contenedor raíz
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

El contenedor raíz de toda rejilla principal debe usar `border-2 border-primary` en lugar de `border border-border`.

**Why:** El usuario estableció esta convención visual para que las rejillas principales tengan un borde verde de 2px que las identifica como elemento primario de la pantalla.

**How to apply:** Al crear cualquier nuevo componente que extienda `GridBase`, el `div` contenedor raíz lleva `rounded-lg border-2 border-primary bg-background overflow-hidden`. No aplica a paneles dependientes (ej. panel de transiciones en eventos.component.ts).
