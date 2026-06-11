---
name: ui-libraries-tailwind-spartan
description: Frontend usa Tailwind CSS + Spartan (spartan-ng); Angular Material y PrimeNG descartados. Infraestructura de estilos documentada.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5ce44719-ad2b-4ac4-a9dc-b5c876ab4ff5
---

Usar **Tailwind CSS** + **Spartan** (`spartan-ng`, headless components estilo shadcn/ui para Angular) para todo el frontend.

**Why:** El usuario decidió cambiar completamente de enfoque. Angular Material y PrimeNG han sido descartados.

**How to apply:** No proponer ni usar `@angular/material`, `@angular/cdk` (salvo que Spartan lo requiera internamente), ni `primeng`. Todas las vistas nuevas se construyen con clases Tailwind y componentes Spartan.

---

## Infraestructura de estilos (CRÍTICO)

**El único archivo compilado es `src/styles.css`** (`angular.json` → `"styles": ["src/styles.css"]`).
El archivo `src/styles.scss` existe pero NO está en el build — nunca editarlo para cambios globales.

### Dónde va cada cambio

| Qué | Dónde |
|---|---|
| Fuente, tamaño, interlineado globales | `@theme` y `@layer base` en `src/styles.css` |
| Colores del tema (primary, background…) | Variables CSS en `:root` en `src/styles.css` |
| Estilo de componente Spartan | Directiva en `src/app/spartan/<componente>/src/lib/` vía `classes(() => '...')` |
| Estilo de componente de la app | Clases Tailwind inline en el template, nunca `styles:` del componente |

### Fuente actual

Inter, 13px, line-height 1.4 — definida en `src/styles.css`:
```css
@theme { --font-sans: 'Inter', system-ui, sans-serif; }
@layer base {
  html { font-size: 13px; line-height: 1.4; }
  html, body { @apply font-sans; }
  table, th, td, ... { font: inherit; } /* tablas no heredan por defecto */
}
```
