---
name: feedback-ng-serve-node
description: "Node no está en el PATH del sistema — ng serve falla con 'env: node: No such file or directory' si se lanza sin el PATH correcto"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Node está instalado en `/opt/plesk/node/24/bin/` y NO está en el PATH por defecto del sistema.

**Why:** El entorno del servidor usa Plesk, que instala node en una ruta no estándar.

**How to apply:** Siempre arrancar `ng serve` (y cualquier comando npm/npx) con el PATH extendido:
```bash
PATH=/opt/plesk/node/24/bin:$PATH node_modules/.bin/ng serve --host 0.0.0.0 --port 4200 --configuration development > /tmp/data4n6-frontend.log 2>&1 &
```

Si al arrancar ng serve el log `/tmp/data4n6-frontend.log` muestra `env: 'node': No such file or directory`, es este problema.
