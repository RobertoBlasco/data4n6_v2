# data4n6 — Forensic Evidence Management System

International forensic evidence management platform.

**Stack:** Spring Boot 3.5 · Angular (frontend) · PostgreSQL 17 · JasperReports Server Community · n8n · MinIO  
**Language:** English (codebase, UI, field names)  
**Primary key:** UUID on all tables  
**Build:** Maven · Java 21

---

## Documentation

| File | Contents |
|---|---|
| [docs/frontend.md](docs/frontend.md) | Angular conventions — grids, forms, layout, Material, font |
| [docs/dev-setup.md](docs/dev-setup.md) | Prerequisites, project structure, start environment, local services |
| [docs/architecture.md](docs/architecture.md) | Backend architecture, multi-tenancy, base entity, Flyway, core design principles, settings |
| [docs/database.md](docs/database.md) | Database naming conventions — table prefixes, PKs, FKs, data types, constraints |
| [docs/data-model.md](docs/data-model.md) | Main hierarchy, entities, statuses, polymorphic tables, dynamic metadata |
| [docs/modules-evidence.md](docs/modules-evidence.md) | Chain of custody, lab reception, packaging, condition, special transfer, encryption |
| [docs/modules-analysis.md](docs/modules-analysis.md) | Log import, forensic artifacts, knowledge base, reporting, expert report, peer review |
| [docs/modules-cases.md](docs/modules-cases.md) | Judicial authorization, work assignment, event validation, trial preparation, progress reports |
| [docs/modules-optional.md](docs/modules-optional.md) | OSINT, two-person integrity, SLA, offline/sync, compliance frameworks, external API |
