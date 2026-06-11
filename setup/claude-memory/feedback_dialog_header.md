---
name: feedback-dialog-header
description: "Patrón completo de diálogo: cabecera verde con icono, sin X, botones Cancelar rojo suave / Alta+Siguiente verde atenuado / Alta verde sólido"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Los diálogos deben tener la cabecera con el mismo color verde que la rejilla (`bg-primary text-primary-foreground`), incluyendo el icono de la tabla. El botón X se elimina porque ya existe el botón Cancelar.

**Why:** Uniformidad visual entre rejilla y su diálogo de alta/edición. La X es redundante con Cancelar.

**How to apply:** En `hlm-dialog-content` pasar `[showCloseButton]="false"`. Reemplazar `<div hlmDialogHeader>` por:

```html
<hlm-dialog-content class="sm:max-w-lg" [showCloseButton]="false">
  <div class="bg-primary text-primary-foreground flex items-center gap-2 px-4 h-11 -mx-6 -mt-6 mb-2 rounded-t-lg">
    @if (meta()?.icono) {
      <ng-icon hlmIcon size="sm" [name]="meta()!.icono!" />
    }
    <h2 class="text-sm font-semibold">Nuevo / Editar …</h2>
  </div>
```

El diálogo de confirmación de borrado usa `bg-destructive text-destructive-foreground` en lugar de `bg-primary`.

El padding del diálogo es `p-6`, por eso `-mx-6 -mt-6` extiende la cabecera hasta los bordes y `rounded-t-lg` mantiene las esquinas redondeadas.

**Botones del footer:**
- `Cancelar` → `variant="outline" class="border-destructive bg-destructive/80 text-white hover:bg-destructive/90 hover:text-white"` (rojo con fondo semi-sólido y texto blanco)
- `Alta + Siguiente` / `Alta + Formulario` / `Aceptar + Formulario` → `variant="default"` (mismo verde sólido que Alta)
- `Alta` / `Aceptar` → `variant="default"` (verde sólido, acción principal)
- `Eliminar` (diálogos de confirmación) → `variant="destructive"` (rojo suave, diferenciado del Cancelar)

Ver implementación de referencia: `features/inventory/admin/catalog-admin/catalog-admin.component.ts`
