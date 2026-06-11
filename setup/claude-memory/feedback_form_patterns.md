---
name: feedback-form-patterns
description: Doctrina de formularios de alta — cuándo usar diálogo vs. SPA y qué botones lleva cada diálogo
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

Diálogo para altas simples (catálogos: marcas, categorías, estados...). Pantalla completa SPA para entidades complejas (casos, eventos, órdenes de préstamo...).

**Why:** Separación clara de complejidad — no sobrecargar catálogos con pantallas innecesarias.

**How to apply:** Al decidir el patrón de alta de cualquier entidad nueva, preguntar si es un catálogo simple o una entidad de negocio compleja.

### Botones obligatorios en diálogos de alta

| Botón | Comportamiento |
|---|---|
| Cancelar | Cierra sin guardar |
| Alta + Siguiente | Guarda y deja el diálogo abierto/limpio para otro alta |
| Alta | Guarda y cierra el diálogo |
| Alta + Formulario | Guarda y navega a la pantalla SPA del ítem (solo si la entidad tiene SPA propia) |

El orden es siempre: Cancelar — Alta + Siguiente — Alta — Alta + Formulario.
