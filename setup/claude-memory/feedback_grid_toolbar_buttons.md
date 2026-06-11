---
name: feedback-grid-toolbar-buttons
description: "Estándar de botones en toolbar de rejillas: alta = icono ghost; destructivo = outline rojo suave"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 804770d8-1fa0-4802-a2f0-e6aae75d93a1
---

En la toolbar de las rejillas, los botones siguen dos patrones fijos:

**Botón de alta (añadir nuevo registro):**
```html
<button hlmBtn variant="ghost" size="icon" class="size-7 hover:bg-primary-foreground/15 hover:text-primary-foreground" title="Nueva <entidad>" (click)="goNew()">
  <ng-icon hlmIcon size="sm" name="lucidePlus" />
</button>
```
- Solo icono, sin texto
- `variant="ghost" size="icon" class="size-7"`
- `title` para tooltip accesible

**Botón destructivo en toolbar (cancelar, eliminar):**
```html
<button hlmBtn variant="outline" class="h-8 shrink-0 text-red-600 border-red-400 hover:bg-red-50">
  Cancelar / Eliminar
</button>
```
- Fondo rojo suave (no rojo sólido)
- `text-red-600 border-red-400 hover:bg-red-50`

**Why:** El usuario prefiere toolbars limpias; el icono es suficiente para "añadir" y los botones con texto rojo suave son menos agresivos que `variant="destructive"`.

**How to apply:**
- Aplicar a todos los botones de alta en toolbars de rejillas (16+ componentes ya migrados a junio 2026)
- Los botones Cancelar dentro de diálogos de formulario siguen su propio patrón (`feedback_dialog_header.md`)
- Nunca usar `border-white/40 hover:bg-white/10` en toolbars
