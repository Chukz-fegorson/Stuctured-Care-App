# Structure Health

Structure Health is a Java-first EHR, EMR, HIMS, hospital operations, payer, and public health platform designed to coordinate the full care and claims journey across patients, providers, hospitals, HMOs, and the Ministry of Health.

This repository starts with:

- product planning and delivery documentation
- a shared Java domain module
- a Spring Boot backend API module wired for PostgreSQL
- a Spring Boot frontend shell for the first responsive operational dashboard

## Product Goal

Build a trusted healthcare operating system that makes patient movement, clinical operations, billing, claims, reconciliation, compliance, and public health reporting visible and traceable from one platform.

## Core Actors

- Patients and dependants
- Doctors, nurses, pharmacists, lab scientists, and care coordinators
- Hospital management and departmental leads
- HMO operations, claims, and finance teams
- Ministry of Health analysts and regulators
- Platform administrators and auditors

## Technical Direction

- Java 21
- Spring Boot modular monolith as the first delivery architecture
- PostgreSQL as the system of record
- Flyway for schema migrations
- Spring Security for authentication and authorization foundations
- Server-rendered frontend shell with responsive design and contract-first API boundaries

This starting shape is deliberate: it is faster to deliver, easier to govern, and still allows later extraction into separate services when scale or regulatory isolation requires it.

## Repository Layout

- `docs/` product strategy, workflows, and implementation plan
- `shared-domain/` shared enums and access primitives
- `backend/` clinical, operational, claims, reconciliation, and reporting APIs
- `frontend/` responsive portal shell for operations and executive dashboards

## Initial Bounded Contexts

- Identity and access management
- Master organization and department registry
- Patient administration and care journey
- Claims and utilization management
- Reconciliation and settlement
- Compliance, broadcast, and ministry reporting

## Local Run Plan

1. Create a PostgreSQL database for the backend.
2. Set `STRUCTURE_HEALTH_DB_URL`, `STRUCTURE_HEALTH_DB_USERNAME`, and `STRUCTURE_HEALTH_DB_PASSWORD`.
3. Run the backend with `mvn -pl backend spring-boot:run`.
4. Run the frontend shell with `mvn -pl frontend spring-boot:run`.

The backend defaults to port `8081`. The frontend defaults to port `8080`.

## Recommended Next Delivery Slice

1. Identity, organizations, departments, and role model
2. Patient registration and encounter lifecycle
3. Claims submission and reconciliation workflow
4. Ministry dashboard, compliance events, and broadcast center

