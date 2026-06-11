---
name: project-dynamic-field-config
description: "Plan PENDIENTE: configuración dinámica del estilo de campos editables via t900_configuracion (V121)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Plan para hacer configurables el fondo y borde de los campos editables desde una tabla en base de datos, sin tocar código.

**Why:** Actualmente el estilo está hardcodeado (`bg-action/5 border-primary`). El usuario quiere poder cambiarlo desde una pantalla de administración.  
**How to apply:** Implementar cuando se retome. Próxima migración disponible: V121.

---

## Diseño

### Backend — V121

```sql
CREATE TABLE app.t900_configuracion (
  clave       VARCHAR(100) PRIMARY KEY,
  valor       TEXT NOT NULL,
  descripcion TEXT
);
INSERT INTO app.t900_configuracion VALUES
  ('ui.campo.fondo',  'oklch(0.796 0.18 83 / 0.05)', 'Fondo de campos editables'),
  ('ui.campo.borde',  '#005a3b',                      'Borde de campos editables');
```

Endpoint: `GET /api/v1/config/ui` → devuelve mapa `{ clave: valor }` de todas las claves `ui.*`  
Endpoint: `PUT /api/v1/config/ui` → actualiza valores

### Frontend

1. Cambiar `HlmInput` y `FkComboboxComponent` para usar variables CSS en vez de clases Tailwind:
   - `bg-[var(--field-bg)]` en lugar de `bg-action/5`
   - `border-[color:var(--field-border)]` en lugar de `border-primary`

2. En `styles.css` definir defaults:
   ```css
   :root {
     --field-bg: oklch(0.796 0.18 83 / 0.05);
     --field-border: #005a3b;
   }
   ```

3. `AppConfigService` que al arrancar llama al endpoint y aplica:
   ```typescript
   document.documentElement.style.setProperty('--field-bg', config['ui.campo.fondo']);
   document.documentElement.style.setProperty('--field-border', config['ui.campo.borde']);
   ```

4. Pantalla de admin para editar y guardar los valores.

### Limpieza previa

Antes de implementar, eliminar los botones de prueba `fieldBg`/`fieldBorder` del `loan-form.component.ts`.
