---
name: project-context
description: "Estado completo del proyecto data4n6_v2 — stack, infraestructura, scripts, componentes clave (actualizado 2026-06-11)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 804770d8-1fa0-4802-a2f0-e6aae75d93a1
---

## Stack
- Backend: Spring Boot 3.5, Hibernate, Flyway, MinIO (Docker), PostgreSQL schemas: common, tenant_default
- Frontend: Angular 21, Tailwind CSS v4 + Spartan (spartan-ng), signals, standalone components

## Arranque (IMPORTANTE)
- **Nunca usar `mvn clean spring-boot:run`** — tarda 15+ min compilando y el script lo mata
- **restart.sh** usa `java -jar target/*.jar` (arranca en ~20s)
- Lee `.spring-profile` (para Docker local) y `.node-bin-dir` (ruta Node) si existen en la raíz
- Recompilar tras cambios Java: `cd data4n6-backend && mvn package -DskipTests -q`

## Setup en máquina nueva
```bash
curl -fsSL https://raw.githubusercontent.com/RobertoBlasco/data4n6_v2/main/setup-dev.sh -o setup-dev.sh
chmod +x setup-dev.sh && ./setup-dev.sh
```
- Instala Docker, Java 21, Maven, Node.js si faltan
- Levanta PostgreSQL (5432) + MinIO (9000/9001) con Docker Compose
- npm install, compila JAR, instala memoria Claude
- Para historial /resume: ejecutar `./export-conversations.sh` en origen → copiar `conversations/` junto al script

## Infraestructura Docker local
- PostgreSQL: localhost:5432, data4n6/data4n6
- MinIO: localhost:9000 API, localhost:9001 consola, data4n6/data4n6secret
- application-local.properties sobrescribe la URL de producción (192.168.0.16:5433)
- .spring-profile contiene "local" → restart.sh pasa --spring.profiles.active=local al JAR

## Migraciones Flyway — V156 última aplicada
- V156: icono en t900_apps

## Componentes compartidos clave (shared/components/)
- **StandarTabPanelComponent** — tabs notas/documentos/fotos. Usa `viewChild()` no-required + `?.count() ?? 0`
- **t300-notes, t300-documents, t300-pictures** — componentes standalone adjuntos polimórficos
- **DetailTreeComponent** — árbol navegación SPA, hover ámbar bg-action/25
- **HistoricalGridComponent** — rejilla histórica con sort, selección, data/loading/empty
- **SectionHeaderComponent** — cabecera sección con ng-content para botones
- **PicturePanelComponent, FkComboboxComponent, FormFieldComponent**

## FormBase (shared/form/form-base.ts)
- Clase abstracta para todos los formularios SPA
- Signals: formReadonly(boolean|null), loading, saving, loadError, tableMeta, formIcon, formMode
- formMode===false → modo edición → FormLockService.lock() → shell menu opacity-50
- loadFormMeta() → carga tableMeta e icono desde t900_app_tables; llamar en ngOnInit
- resolvedBackRoute: lee ?back= query param; si no, usa defaultBackRoute

## FormReadonlyDirective + FormLockService
- [appFormReadonly] en div raíz → inyecta FORM_READONLY token + clase .form-readonly
- FormLockService (root) → isLocked → HorizontalShellComponent.navigationDisabled → header opacity-50

## HorizontalShellComponent (layout/)
- Shell del módulo inventario con nav horizontal (NO ShellComponent)
- Registra todos los iconos Lucide usados en el módulo
- navigationDisabled = formLockSvc.isLocked (solo afecta al header, no al router-outlet)

## Rutas principales inventario
- /inventory/items → listado artículos
- /inventory/items/:id → ItemFormComponent (ficha artículo)
- /inventory/orders/loans → préstamos
- /inventory/orders/loans/:id → LoanFormComponent
- /inventory/orders/loans/:id/devolucion → DevolucionFormComponent
- /inventory/orders/returns → devoluciones
- /inventory/orders/warehouse-entries → entradas almacén
- /inventory/admin/:tableName → catálogos dinámicos (CatalogAdminComponent)

## Binarios (MinIO)
- t100_pictures y t100_documents — tablas polimórficas de binarios
- StorageService: upload, getPublicUrl, delete
- Endpoints: POST /inventory/pictures/upload, POST /inventory/documents/upload

## Colores estándar
- Toolbar rejillas: bg-[#005a3b] text-white (nunca bg-primary)
- Hover rejillas: bg-action/25 (ámbar)
- Campos editables: bg-action/5 + border-primary
- Campos readonly: bg-[#f0f0f0]
- --foreground: oklch(0.25 0 0) ≈ #3f3f3f
