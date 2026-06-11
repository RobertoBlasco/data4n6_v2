---
name: feedback_readonly_fields
description: Patrón obligatorio para campos de solo lectura en formularios SPA en modo vista
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

En formularios SPA con modo vista (isView), los campos no editables siguen este patrón obligatorio:

**Regla:** reemplazar comboboxes y date pickers por `<input hlmInput readonly>` con fondo `#f0f0f0`.

```html
<!-- Combobox → input readonly con el NOMBRE (no el ID) -->
@if (isView()) {
  <input hlmInput readonly class="w-full" style="background-color: #f0f0f0" [value]="unidadNombre() || '—'" />
} @else {
  <app-fk-combobox ... />
}

<!-- Date picker → readonly condicional -->
<input hlmInput type="date" class="w-full"
  [readonly]="isView()"
  [style.background-color]="isView() ? '#f0f0f0' : null"
  [value]="fechaSignal()" (change)="..." />
```

**Además en modo vista:**
- Ocultar asteriscos (*): `@if (!isView()) { <span class="text-destructive">*</span> }`
- Ocultar mensajes de error de validación: `@if (campoError() && !isView())`
- Ocultar diálogos de alta rápida: `@if (showDialog() && !isView())`
- Usar `[value]="nombreSignal()"` — mostrar el texto legible, no el UUID

**Por qué:** los comboboxes en modo vista abren desplegables aunque haya un overlay; los date pickers abren el selector de fecha. Los inputs readonly son semánticamente correctos y visualmente consistentes (fondo #f0f0f0 diferencia claramente los campos no editables).

**Cómo aplicar:** siempre que un formulario SPA tenga modo vista/edición. El patrón está documentado en `src/app/shared/components/fk-combobox/fk-combobox-template.component.ts`.
