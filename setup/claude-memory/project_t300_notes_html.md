---
name: project-t300-notes-html
description: t300_notes.body puede contener HTML — no escapar en frontend ni backend
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

`t300_notes.body` es TEXT y puede contener HTML enriquecido.

**Why:** El usuario lo confirmó explícitamente: las notas de la app admiten formato HTML.

**How to apply:** Al implementar el servicio/controller de `t300_notes`, no sanitizar ni escapar el body. En el frontend, renderizar con `innerHTML` o equivalente seguro (sanitizado en cliente si se necesita XSS protection, pero no strips en servidor).
