# TODO

Pending design decisions and features to be addressed in future sessions.

---

## Model design pending

### Destruction / Return of evidence
Formal end-of-life process for Exhibits and Evidences.
- Return to owner or court
- Formal authorized destruction
- Permanent archiving
- Workflow and required authorizations

### Alert workflow
Who receives alerts, how and when.
- To be designed alongside Users and Roles
- Linked to Deadline behaviour (INFORMATIVE · RESTRICTIVE)

---

## Features pending

### Security, roles and users
- Authentication system
- User profiles and roles (ADMIN, INVESTIGATOR, ANALYST...)
- Permissions per role and per entity
- To be implemented in a later phase

### Settings / Configuration
- Department-level configurable preferences
- QR code format
- Evidence numbering format
- Deadline behaviour defaults
- Other preferences TBD

### Evidence type enum values
- Specific types for Event (SEARCH_WARRANT · CLOUD_DOWNLOAD · LAB_SUBMISSION · JUDICIAL_CLONING...)
- Specific types for Acquisition
- Specific types for Analysis
- To be defined — do not block development

### Mobile integration
- Mobile/tablet app or PWA for field use
- Photo capture via mobile device linked to Exhibit/Evidence via QR scan
- Asynchronous upload when connectivity is available

### Chain of custody digital signature
- Electronic signature integration
- Certified timestamp provider
- Legal validity per jurisdiction

### Case templates
- Predefined templates for common investigation types (fraud, cybercrime...)
- Preconfigure Event types, Evidence types, Analysis types, deadlines, checklists

### GDPR & Data compliance
- Data retention policies per case type
- Right to erasure vs forensic data preservation
- Personal data anonymization for archived cases
- Access audit for personal data
- Deferred — forensic databases require full data preservation

### Open Source license
- Choose project license (Apache 2.0, MIT, GPL...)
- GitHub repository setup

### Deadline notifications
- Notification channels (email, in-app, push...)
- Escalation rules
- To be designed with Users and Roles

---

## Stack — technologies to evaluate

### Redis
- Cache for heavy reports and statistics
- Session storage for authentication phase
- Add to Docker Compose when caching or auth is needed
- Spring Boot dependency: `spring-boot-starter-data-redis`

### Keycloak
- Authentication and authorization (OAuth2 / OIDC)
- Standard for Spring Boot enterprise auth
- Add to Docker Compose when security phase begins
- Replaces custom auth implementation entirely

### Meilisearch
- Fast full-text search engine
- Evaluate when PostgreSQL full-text search (`tsvector`) becomes a bottleneck
- Simpler than Elasticsearch, better suited for this use case
- Spring Boot integration via REST client (no official starter)

### AI / Ollama
- Local LLM server (Llama, Mistral, Gemma...) — data never leaves the server (critical for forensic/police context)
- Add to Docker Compose when needed — fully independent, no impact on existing stack
- Use cases: expert report draft generation, semantic search, artifact classification, communication analysis
- Additional tools to evaluate per use case: Tesseract (OCR), Python microservice (image classification with CLIP/YOLO)
