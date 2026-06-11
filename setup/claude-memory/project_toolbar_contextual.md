---
name: project-toolbar-contextual
description: "Toolbar contextual en rejilla de artículos — acciones disponibles según selección múltiple, basadas en t250_eventos (2026-06-02)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e913879d-23c4-4c47-a57a-d0903607e74d
---

## Objetivo
En la rejilla de artículos (`items-list.component.ts`), cuando el usuario hace selección múltiple, mostrar una toolbar contextual con las acciones posibles para todos los artículos seleccionados. Las acciones se calculan como la **intersección** de transiciones permitidas para cada estado.

**Why:** Si selecciono 3 artículos en "Almacén" y 2 en "Adjudicado", sólo se muestran las acciones comunes a ambos estados. Si no hay intersección, sólo aparece "Exportar".

## Estado actual (2026-06-02): Backend COMPLETO, frontend PENDIENTE

### Backend — ya implementado y funcionando

**Endpoint:** `GET /api/v1/inventory/evento-transiciones/acciones-disponibles?estado=X&estado=Y`

- Fichero: `EventoTransicionController.java` → `@GetMapping("/acciones-disponibles")`
- Servicio: `EventoTransicionService.findAccionesDisponibles(List<String> estados)`
- DTO: `AccionDisponibleResponse(UUID eventoId, String nombre, String descripcionCorta, String prefijoReferencia)`
- Repositorio: `EventoTransicionRepository.findDestinoIdsByOrigenIds(List<UUID> origenIds)`

**Mapa de estados → UUIDs de origen** (en `EventoTransicionService.ESTADO_ORIGEN_IDS`):
```java
"Almacén"      → [001(ENT), 002(TRS), 007(DEV), 008(FRP), 009(DAD)]
"Prestado"     → [004(PRS)]
"Adjudicado"   → [003(ADJ)]
"En reparación"→ [005(REP)]
"Baja"         → [] → devuelve List.of() inmediatamente
```

**Transiciones en t250_eventos** (UUID map, V135):
- 001=ENT, 002=TRS, 003=ADJ, 004=PRS, 005=REP, 006=BAJ, 007=DEV, 008=FRP, 009=DAD
- Desde Almacén → {PRS, TRS, BAJ, ADJ, REP}
- Desde Prestado → {DEV}
- Desde Adjudicado → {PRS, DAD}
- Desde En reparación → {FRP}

**Verificado con curl:**
```bash
curl "http://localhost:8080/api/v1/inventory/evento-transiciones/acciones-disponibles?estado=Almacén&estado=Adjudicado"
# → ["Préstamo"] (única acción común)
```

### Frontend — PENDIENTE

**Fichero a modificar:** `src/app/features/inventory/items/items-list.component.ts`

**Qué añadir:**
1. Signal `accionesDisponibles = signal<AccionDisponible[]>([])`
2. `effect()` que reacciona a `selectedIds()` → llama al endpoint con los `estadoActual` únicos de los artículos seleccionados
3. En la toolbar de selección múltiple, renderizar botones por cada acción disponible
4. Mapeo nombre evento → ruta: `'Préstamo' → /inventory/orders/loans/new`, `'Traspaso Almacén' → .../transfers/new`, etc.
5. Siempre mostrar botón "Exportar" (aunque no haya acciones comunes)

**Interface a añadir en items-list:**
```typescript
interface AccionDisponible {
  eventoId: string;
  nombre: string;
  descripcionCorta: string | null;
  prefijoReferencia: string | null;
}
```

**Lógica del effect:**
```typescript
effect(() => {
  const ids = this.selectedIds();
  if (ids.size === 0) { this.accionesDisponibles.set([]); return; }
  const estados = [...ids].map(id => this.allItems().find(a => a.id === id)?.estadoActual).filter(Boolean) as string[];
  const uniqueEstados = [...new Set(estados)];
  const params = uniqueEstados.map(e => `estado=${encodeURIComponent(e)}`).join('&');
  this.http.get<AccionDisponible[]>(`${API_BASE}/evento-transiciones/acciones-disponibles?${params}`)
    .subscribe(acciones => this.accionesDisponibles.set(acciones));
});
```

**How to apply:** Mañana continuar exactamente desde aquí — el backend está completo y verificado.
