# Development Environment

## Prerequisites

- Java 21 (via SDKMAN: `sdk install java 21.0.7-tem`)
- Maven (via SDKMAN: `sdk install maven`)
- Docker + Docker Compose

## Project structure

```
data4n6/
├── README.md
├── TODO.md
└── data4n6-backend/          ← Spring Boot backend
    ├── pom.xml
    ├── docker-compose.yml
    └── src/
        ├── main/
        │   ├── java/com/data4n6/
        │   │   ├── config/           — Spring configuration (JPA, Web, multi-tenancy)
        │   │   ├── common/
        │   │   │   ├── entity/       — BaseEntity (UUID PK, audit fields, soft delete)
        │   │   │   └── exception/    — GlobalExceptionHandler, ResourceNotFoundException
        │   │   ├── tenant/           — Multi-tenancy (TenantContext, Interceptor, Resolver)
        │   │   ├── cases/            — Case entity, repository, service, controller, DTOs
        │   │   ├── events/
        │   │   ├── exhibits/
        │   │   ├── evidence/
        │   │   ├── acquisitions/
        │   │   ├── analyses/
        │   │   ├── catalog/
        │   │   ├── documents/
        │   │   └── persons/
        │   └── resources/
        │       ├── application.properties
        │       └── db/migration/
        │           ├── common/       — migrations for shared catalog schema
        │           └── tenant/       — migrations for tenant schemas
        └── test/
```

## Start the development environment

```bash
# 1. Start Docker services (PostgreSQL, MinIO, n8n)
cd data4n6-backend
docker compose up -d

# 2. Start Spring Boot (from data4n6-backend folder)
source "$HOME/.sdkman/bin/sdkman-init.sh"
mvn spring-boot:run
```

## Local services

| Service | URL | Credentials |
|---|---|---|
| Spring Boot API | `http://localhost:8080` | — |
| Swagger UI | `http://localhost:8080/swagger-ui.html` | — |
| PostgreSQL | `localhost:5432` db: `data4n6` | data4n6 / data4n6 |
| MinIO S3 API | `http://localhost:9000` | data4n6 / data4n6secret |
| MinIO Console | `http://localhost:9001` | data4n6 / data4n6secret |
| n8n | `http://localhost:5678` | admin / admin |
