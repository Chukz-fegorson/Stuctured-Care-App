# Structure Health Implementation Plan

## Delivery Strategy

Build this platform in controlled vertical slices. Each slice must produce a usable workflow that touches frontend, backend, security, data, audit, and reporting.

## Frontend and Backend Delivery Model

Use React for the actual application frontend and keep Java as the backend system of record and workflow engine.

- React will own the role-based user experience for patients, clinicians, hospital operations, HMO users, finance teams, and ministry users.
- Spring Boot will expose secure APIs for identity, patient administration, encounters, billing, claims, reconciliation, reporting, notifications, and audit.
- PostgreSQL remains the transactional source of truth for patient, operational, financial, and compliance data.
- The current server-rendered frontend stays in place only as the About App surface while the real product UI moves into React.

## How React and Java Will Work Together

- React application: route-based workspaces for patient portal, hospital operations, HMO claims, finance, and ministry oversight.
- Java backend: modular monolith with bounded contexts, validation, access control, audit logging, reporting services, and integration adapters.
- API boundary: REST-first APIs for core workflows, with WebSocket or server-sent event support for notifications, queues, and live worklists where needed.
- Authentication and authorization: Java handles authentication, session or token issuance, role resolution, and policy enforcement; React consumes the resolved permissions and renders only allowed actions.
- Messaging and virtual care: Java coordinates message threads, appointments, scheduling rules, and audit; React provides the conversation UI, telehealth workflow screens, and patient-friendly scheduling experience.
- Reporting: Java generates governed datasets and audit-safe summaries; React renders dashboards, drill-downs, filters, exports, and user-specific work queues.
- Deployment model: local development runs React and Java separately, then production can either serve the React build behind the Java application or deploy it as a separate static frontend that points to the same Java APIs.

## Phase 0: Foundations

Duration target: 2 weeks

- establish repository standards and branching model
- define environments, secrets, and deployment pipeline
- establish React frontend workspace and API contract conventions
- create organization, department, and access-control model
- define coding standards, API conventions, and audit rules

## Phase 1: Identity and Registry

Duration target: 3 weeks

- deliver the first React shell with login, navigation, layout primitives, and permission-aware routing
- organization onboarding
- department setup
- role templates and user management
- state, LGA, specialty, and facility reference data
- audit-ready admin portal

## Phase 2: Patient Administration and Encounters

Duration target: 4 to 6 weeks

- patient profile and guarantor data
- patient login and portal dashboard
- patient portal for encounter history, reports, and follow-up visibility
- secure patient-to-hospital messaging
- virtual consultation scheduling and calendar sync foundation
- appointments and check-in
- triage and consultation workflow
- diagnostics, pharmacy, and discharge routing
- encounter timeline and departmental dashboards

## Phase 3: Billing, Payer, and Claims

Duration target: 4 to 6 weeks

- coverage verification
- pre-authorization workflow
- charge capture and invoice generation
- claim package assembly
- HMO review and decision workflow
- hospital billing and HMO React workspaces

## Phase 4: Reconciliation and Settlement

Duration target: 3 to 4 weeks

- automated variance rules
- reconciliation work queues
- dispute notes and evidence trail
- settlement state machine
- executive finance dashboard

## Phase 5: Ministry Oversight and Compliance

Duration target: 3 to 4 weeks

- public health dashboard
- compliance indicators and exceptions
- targeted broadcast center
- regulatory submissions and audit exports

## Module-by-Module Execution Plan

### Module 1: Platform Foundation

- identity, access model, consent, audit, organizations, departments, and master reference data
- React foundation screens for authentication, workspace selection, and admin setup
- Java APIs for provisioning, authorization, and reference data governance

### Module 2: Patient Administration and Portal

- patient registration, guarantors, coverage readiness, appointments, and patient profile
- patient portal for previous encounters, future encounters, reports, reminders, and messaging
- virtual consultation scheduling, calendar sync hooks, and encounter-linked communication threads

### Module 3: Clinical and Department Flow

- triage, consultation, admission, care plan, diagnostics, pharmacy, ward, theatre, discharge, and follow-up
- departmental work queues and accountable handoff status
- patient-centred clinical timeline and encounter output

### Module 4: Hospital Operations

- service readiness, queue control, staffing indicators, bed and theatre utilization, discharge control, and revenue leakage monitoring
- administrative reporting around requested, done, undone, pending, billed, and unbilled work

### Module 5: HMO, Billing, and Claims

- eligibility, benefit validation, pre-authorization, charge capture, claim assembly, medical review, and remittance
- reports for claimed, unclaimed, approved, denied, and aging services

### Module 6: Reconciliation and Finance

- variance detection, dispute workflow, settlement tracking, evidence management, and user accountability trail
- reports showing who billed, who claimed, who reconciled, and where work stopped

### Module 7: Reporting, Compliance, and Ministry Oversight

- patient-centred clinical reporting
- administrative service accountability reporting
- executive dashboards, compliance alerts, broadcast center, and ministry health surveillance dashboards

## Delivery Rule for Every Module

Each module must ship with these elements before it is considered complete:

- React user flows for every approved role in scope
- Java APIs and business rules
- PostgreSQL schema migrations
- audit logging and access control
- reporting outputs for the module
- test coverage for core rules and high-risk workflows
- seed data and demo scenarios for review

## Phase 6: Hardening and Scale

Duration target: ongoing

- performance testing and indexing
- data retention and archival strategy
- security review and penetration testing
- observability, alerting, and incident playbooks
- interoperability integrations

## Recommended Team Shape

- Product management
- UX and service design
- Backend Java engineers
- Frontend engineers for portal experience
- QA and test automation
- DevOps and platform engineering
- Health informatics and compliance advisory

## Non-Functional Requirements

- strict role-based authorization
- complete audit trail for sensitive records
- 99.9 percent availability target for production
- encrypted transport and secrets handling
- secure messaging and voice/video integration support
- background jobs for heavy reconciliation and reporting workloads
- accessible UI and responsive layouts
- migration-safe database evolution

## Initial Technical Decisions

- Java 21 baseline
- Spring Boot for API and web apps
- PostgreSQL for transactional storage
- Flyway for schema management
- Maven multi-module repository
- REST-first contracts to support future mobile and third-party clients

## First Milestone Definition

The first milestone is successful when a hospital admin can onboard a hospital, create departments, create users, register a patient, open an encounter, submit a simple claim, and expose the result on a ministry-facing dashboard with audit history.
