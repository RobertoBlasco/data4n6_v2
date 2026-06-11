---
name: feedback-font-standard
description: Roboto is the standard font for the entire application — all text must use it unless explicitly requested otherwise
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5ce44719-ad2b-4ac4-a9dc-b5c876ab4ff5
---

Roboto, 'Helvetica Neue', sans-serif is the **only** font family used in this application.

**Why:** The user wants visual consistency between all UI elements (menu, tables, titles, forms, buttons). Any deviation requires explicit approval.

**How to apply:**
- `index.html` carga Roboto desde Google Fonts (wght 300;400;500)
- `styles.css` define `--font-sans: 'Roboto', 'Helvetica Neue', system-ui, sans-serif` en `@theme` — todos los componentes Tailwind/Spartan heredan Roboto via `font-sans`
- `html, body { @apply font-sans }` en `styles.css` propaga la fuente en cascada
- `styles.scss` (Angular Material legacy, ya NO incluido en el build) tenía el override `!important`; el mecanismo actual es via la variable `--font-sans`
- Never set a different `font-family` in individual components
- Page titles, labels, inputs, buttons, table cells, menu items — all Roboto
- Font **size** and **weight** can vary per element, but the typeface never changes
