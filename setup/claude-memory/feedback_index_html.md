---
name: feedback-index-html
description: index.html no debe tener stylesheets render-blocking de CDN externas — causa spinner infinito si la red es lenta
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

`<link rel="stylesheet">` de CDNs externas en `src/index.html` bloquea el render del browser.

**Why:** El `<link rel="stylesheet">` es render-blocking por especificación HTML. Si el CDN tarda o no responde, el browser muestra un spinner infinito. Esto fue el caso de `https://fonts.googleapis.com/icon?family=Material+Icons` que quedó en index.html como resto de Angular Material aunque el paquete ya no estaba instalado.

**How to apply:**
- Revisar `src/index.html` cuando el frontend "se quede pensando" — buscar `<link rel="stylesheet">` que apunten a CDNs externas
- Para Google Fonts usar siempre `display=swap` y `<link rel="preconnect">` previo
- Nunca dejar stylesheets de librerías desinstaladas (Angular Material, PrimeNG, etc.)

Estado actual de `index.html`: solo carga Roboto de Google Fonts con preconnect, sin Material Icons.
