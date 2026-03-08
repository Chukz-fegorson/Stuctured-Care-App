# Structure Health

Structure Health is a Java-first EHR, EMR, HIMS, hospital operations, payer, and public health platform designed to coordinate the full care and claims journey across patients, providers, hospitals, HMOs, and the Ministry of Health.

This repository starts with:

- product planning and delivery documentation
- a shared Java domain module
- a Spring Boot backend API module wired for PostgreSQL and ready to serve the production React app
- a Spring Boot frontend shell for the current About App experience
- a React workspace for the actual role-based application frontend

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
- React as the upcoming application frontend
- Spring Boot APIs as the system orchestration layer for the React frontend and future clients
- The current server-rendered frontend shell is kept as the About App experience and planning surface

This starting shape is deliberate: Java remains the governed core of the platform, while React becomes the role-aware user experience layer for patients, clinicians, hospital operators, HMOs, and regulators.

## Repository Layout

- `docs/` product strategy, workflows, and implementation plan
- `shared-domain/` shared enums and access primitives
- `backend/` clinical, operational, claims, reconciliation, and reporting APIs
- `frontend/` current About App shell and transition surface until the React application is introduced
- `webapp/` React application workspace for the actual patient, hospital, HMO, finance, and ministry UI

## Initial Bounded Contexts

- Identity and access management
- Master organization and department registry
- Patient administration and care journey
- Patient portal, messaging, and virtual consultation
- Claims and utilization management
- Reconciliation and settlement
- Compliance, broadcast, and ministry reporting

## Local Run Plan

1. Use the local PostgreSQL 17 Windows service as the permanent system of record on `localhost:5432`.
2. Build the stable app with `app-local-build.cmd`.
3. Start the stable app with `app-local-start.cmd`.
4. Open `http://localhost:6060`.
5. Use `webapp-dev.cmd` only when you explicitly want Vite development mode.

The stable app and API are served together on `6060`. The About App still defaults to port `8080` if you run the separate `frontend` module. The Vite development server now defaults to `6061`.

For local development, the default PostgreSQL database identifier is `strutured_care` on `localhost:5432`. This is the same PostgreSQL service you can inspect directly in pgAdmin for live queries and real-time data verification.

## Stable Runtime

- `app-local-build.cmd` builds the React production bundle and packages the executable Spring Boot backend jar.
- `app-local-start.cmd` starts the packaged services against the Windows PostgreSQL service on `5432`, which serves both the React app and the `/api` endpoints on `http://localhost:6060`.
- `app-local-stop.cmd` stops the local app processes on `6060` through `6065` and leaves the shared PostgreSQL service running.

## pgAdmin Setup

Use [database/pgadmin-setup.md](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/pgadmin-setup.md) and [pgadmin-bootstrap.sql](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/pgadmin-bootstrap.sql) to provision the `strutured_care` role and database on the local PostgreSQL service. Once that database exists, pgAdmin and the app will both point at the same live data.

## Demo Data Reset

- Run [demo-reset.cmd](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/demo-reset.cmd) for a one-click local reset and reseed.
- In pgAdmin, run [demo-reset.sql](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/demo-reset.sql) followed by [demo-seed.sql](/c:/Users/chuks.omedo/Desktop/JAVA%20PROJECTS/Structure%20Health/database/demo-seed.sql).
- In the app, `Platform Admin` and `Hospital Admin` can trigger the same reset from the Admin workspace.

## Recommended Next Delivery Slice

1. Identity, organizations, departments, and role model
2. Patient registration, portal access, and encounter lifecycle
3. Claims submission and reconciliation workflow
4. Ministry dashboard, compliance events, and broadcast center
