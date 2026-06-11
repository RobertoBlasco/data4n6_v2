---
name: project-context
description: Estado completo del proyecto data4n6_v2 — stack, migraciones, componentes, patrones clave (actualizado 2026-06-08)
metadata:
  type: project
---

## Stack
- Backend: Spring Boot 3.5, Hibernate, Flyway, MinIO (Docker), PostgreSQL schemas: common, inventario, seguridad
- Frontend: Angular 21, Tailwind CSS v4 + Spartan (spartan-ng), signals, standalone components

## Migraciones — V148-V150 aplicadas; V151-V155 pendientes de reinicio backend
- V148: t100_photos → t100_pictures (renombra tabla y PK)
- V149: añade t200_pictures_id, es_principal, caption a t100_pictures; t200_documents_id a t100_documents
- V150: elimina t300_pictures y t300_documents
- V151-V155: iconos en t900_app_tables para todas las tablas de órdenes

## Binarios (MinIO)
- t100_pictures (era t100_photos) y t100_documents son las tablas polimórficas de binarios
- StorageService: upload, getPublicUrl, delete (MinIO)
- Endpoints: POST /inventory/pictures/upload, POST /inventory/documents/upload, PATCH /pictures/{id}/set-principal

## Familia de iconos de órdenes (t900_app_tables + frontend)
- Artículo: lucidePackage | Entrada almacén: lucideArrowDownToLine | Traspaso: lucideArrowRightLeft
- Préstamo: lucidePackageOpen | Devolución: lucidePackageCheck | Adjudicación: lucidePackagePlus | Baja: lucideArchive

## Componentes compartidos (shared/components/)
- DetailTreeComponent (app-detail-tree) — árbol navegación SPA, hover ámbar bg-action/25
- HistoricalGridComponent (app-historical-grid) — rejilla histórica; inputs: data, loading, empty, emptyMessage, selectable, defaultSort; expone sortedData(), toggleSort(), isSelected(), selectedId
- SectionHeaderComponent (app-section-header) — cabecera sección; ng-content para botones derecha
- PicturePanelComponent, FkComboboxComponent, FormFieldComponent (detecta FORM_READONLY)

## FormBase (shared/form/form-base.ts)
- Clase abstracta para todos los formularios SPA
- Protected: colMetaTableName, icon, labelSingular, defaultBackRoute
- Signals públicos: formReadonly(boolean|null), tableMeta, formIcon(), formTitle(), resolvedBackRoute()
- loadFormMeta() → carga tableMeta e icono desde t900_app_tables; llamar en ngOnInit
- formReadonly.set(true/false/null) → cada form lo setea según su lógica

## FormReadonlyDirective (shared/form/form-readonly.directive.ts)
- [appFormReadonly]="formReadonly()" en el div raíz de cada formulario
- Provee FORM_READONLY injection token → FormFieldComponent lo inyecta y aplica gris al label
- Añade clase CSS .form-readonly al host → styles.css: input/textarea/select → color:var(--muted-foreground)

## SpaFormHeaderComponent
- Input [readonly]: null=sin badge, true="Solo lectura", false="Edición"
- Input [backRoute]="resolvedBackRoute()" — contextual vía ?back= query param

## Historial de movimientos (item-form) 
- ArticuloMovimientoResponse: fecha, tipoEvento, estadoOrden, detalle(N/M), ordenId, ordenCategoria
- ordenCategoria: "prestamo","devolucion","entrada","baja","traspaso","adjudicacion"
- Doble clic → goToOrden(): navega a la orden correspondiente con back route contextual
- "Devolución Préstamo" tiene ordenCategoria="prestamo" (la orden vinculada ES el préstamo)

## DevolucionFormComponent
- Modo vista (isView): lineasPendientes.length===0 OR ?devRef= param presente
- ?devRef=REF → muestra solo artículos de esa devolución específica
- Sección "Orden de préstamo" con lucidePackageOpen + botón ir al préstamo

## Colores estándar
- --grid-foreground → oklch(0.145 0 0) → HlmTd + HistoricalGridComponent tbody td
- text-muted-foreground → oklch(0.556 0 0) → campos readonly y labels en formularios solo lectura
- .form-readonly input/textarea/select → color: var(--muted-foreground) !important (styles.css)
- Hover rejillas: bg-action/25 = oklch(0.796 0.18 83 / 0.25) (ámbar)

## Navegación contextual (FormBase.resolvedBackRoute)
- Lee ?back= query param; si no, usa defaultBackRoute definido en cada subclase
- Uso: router.navigate([ruta], { queryParams: { back: currentUrl } })
