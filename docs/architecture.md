# Structure Health Architecture

## Recommended Delivery Architecture

Start with a modular monolith using Spring Boot and PostgreSQL. This is the fastest path to a reliable release while preserving clean module boundaries for later service extraction.

Why this shape:

- healthcare workflows are deeply transactional
- early-stage teams move faster with one deployable backend
- audit, authorization, and reporting are easier to enforce centrally
- domain boundaries can still be explicit in code and database design

## Proposed Modules

### Shared Domain

Common enums, identifiers, access models, and domain contracts used by backend and frontend.

### Backend API

Spring Boot service responsible for:

- patient administration
- patient portal, messaging, and virtual consultation scheduling
- encounters and care workflow
- payer and claims processing
- reconciliation and finance events
- ministry reporting APIs
- audit and compliance events

### Frontend Shell

Spring Boot web application providing:

- responsive executive dashboard
- patient portal shell for encounter history, messaging, and virtual care
- role-specific portal shells
- form-driven operational workflows
- thin JavaScript enhancements where interaction adds value

## Core Domain Boundaries

- `identity-access`
- `organization-registry`
- `patient-records`
- `patient-engagement-telehealth`
- `encounters-clinical`
- `orders-diagnostics-pharmacy`
- `billing-claims`
- `reconciliation-settlement`
- `broadcast-compliance-reporting`

## Backend Practices

- PostgreSQL as the primary transactional store
- Flyway migrations for every schema change
- REST APIs versioned under `/api/v1`
- DTO boundaries between transport and persistence models
- clear service and repository separation
- event publication for audit, dashboard updates, patient messaging, and reminder scheduling
- soft-delete or archival strategy for regulated records

## Frontend Practices

- componentized templates and reusable page fragments
- dashboard-first information hierarchy for each persona
- responsive layouts for desktop, tablet, and mobile
- keyboard-friendly forms and accessible navigation
- patient-facing messaging, encounter history, and virtual-care scheduling must remain simple and mobile-friendly
- action gating driven by backend permission model

## Security Model

- authenticated users belong to one primary organization
- authorization checks combine role, organization, department, and record scope
- audit logging is mandatory for reads of sensitive data and all writes
- PHI and financial data need row-level filtering policies in services

## Data Strategy

- reference data standardized centrally
- transactional events normalized around patient, encounter, claim, and settlement entities
- patient-centred clinical reports are derived from patient and encounter timelines
- administrative accountability reports are derived from service request, completion, billing, claim, and user-action events
- analytics views derived from trusted operational data
- support for future interoperability adapters such as HL7 FHIR, claims clearing, and national health ID integrations

## Deployment Direction

Phase 1:

- one backend deployment
- one frontend deployment
- one PostgreSQL instance

Phase 2:

- background workers for reconciliation, reporting, notifications, reminders, and calendar synchronization
- object storage for documents and clinical attachments
- media session and communication integrations for voice and video consultation
- caching for high-volume dashboards

Phase 3:

- selective service extraction by bounded context
- read replicas and reporting warehouse
- multi-region deployment where policy requires it
