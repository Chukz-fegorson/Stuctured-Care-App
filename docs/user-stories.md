# Structure Health User Stories

## Epic 1: Identity and Access

### Story 1

As a platform administrator, I want to onboard organizations, departments, and user roles so every action is restricted by approved access levels.

Acceptance focus:

- users belong to an organization and optionally to a department
- users inherit role permissions and data scope
- every access change is auditable

### Story 2

As a ministry regulator, I want access to compliance dashboards without seeing private records outside my approved scope so oversight stays lawful and focused.

Acceptance focus:

- regulator dashboards expose aggregated and approved detail only
- restricted patient-level records require explicit permission policy

## Epic 2: Patient Journey

### Story 3

As a patient, I want a single profile that follows me from registration to discharge so I do not repeat my information at every touch point.

Acceptance focus:

- one patient identity links appointments, encounters, diagnostics, medications, and bills
- hospitals and HMOs can see only the records allowed by policy

### Story 4

As a doctor, I want to review patient history, document the encounter, request diagnostics, and issue treatment instructions from one screen so care decisions happen faster.

Acceptance focus:

- encounter timeline includes notes, orders, results, and prescriptions
- each department sees only the tasks routed to it

### Story 5

As a nurse or care coordinator, I want visibility into triage, admission, transfer, and discharge tasks so handoffs do not fail between departments.

Acceptance focus:

- workflow states are visible by patient and department
- overdue tasks are highlighted

### Story 6

As a patient, I want a portal where I can review previous encounters, future appointments, reports, and follow-up instructions so I remain informed between visits.

Acceptance focus:

- portal shows prior and upcoming encounters tied to the patient identity
- patient can access approved reports, prescriptions, and discharge documents
- follow-up and reminders remain visible after discharge

### Story 7

As a patient, I want secure chat plus scheduled voice or video consultation with the hospital so I can receive remote support and virtual care when appropriate.

Acceptance focus:

- messages are routed to the correct hospital team with auditable response history
- virtual consultations can be scheduled and synchronized to calendars
- consultation notes and outcomes attach to the patient timeline

## Epic 3: Hospital and Department Operations

### Story 8

As a hospital administrator, I want dashboards for admissions, waiting patients, bed usage, diagnostics backlog, pharmacy status, and billed services so I can manage capacity and service quality.

Acceptance focus:

- operational dashboard refreshes from real workflow events
- department heads can drill into their own queues

## Epic 4: Insurance and Claims

### Story 9

As an HMO officer, I want to validate patient eligibility and pre-authorization requests before care is billed so I can manage utilization correctly.

Acceptance focus:

- eligibility checks are tied to payer plans and patient membership
- approvals and denials keep reasons and timestamps

### Story 10

As a hospital billing officer, I want to submit claims with supporting clinical and financial evidence so claims move through review without repeated manual follow-up.

Acceptance focus:

- claim packages reference encounter records, portal follow-up events where relevant, orders, and billed line items
- status updates notify the right internal teams

### Story 11

As a finance and reconciliation analyst, I want automated comparison between patient, hospital, and HMO positions so mismatches are flagged before settlement is closed.

Acceptance focus:

- variance rules identify amount, coverage, and authorization gaps
- reconciliation cases preserve comments, evidence, and outcome history

## Epic 5: Ministry Oversight and Broadcast

### Story 12

As a ministry analyst, I want dashboards across hospitals, HMOs, and regions so I can monitor utilization, disease trends, and compliance issues.

Acceptance focus:

- dashboards support filters by geography, facility type, time, and approved patient-service trends
- approved metrics can be exported and audited

### Story 13

As a ministry official, I want to send targeted broadcasts to hospitals, HMOs, or all platform users so policy directives reach the right audience immediately.

Acceptance focus:

- broadcasts can target organization types, states, regions, or all users
- delivery and acknowledgment status are visible

## Epic 6: Reporting and Accountability

### Story 14

As a doctor, patient, hospital reviewer, or HMO reviewer, I want clinical reports to be structured around the patient and what was done for them so care review stays longitudinal and evidence-based.

Acceptance focus:

- reports are grouped by patient and encounter history
- reports capture findings, procedures, medications, outcomes, and follow-up actions
- reports identify who performed or approved each clinical action

### Story 15

As a hospital operations lead, finance officer, HMO reviewer, or auditor, I want administrative reports to show requested, done, undone, pending, billed, unbilled, claimed, and unclaimed services so accountability gaps are visible immediately.

Acceptance focus:

- reports can be filtered by patient, service, department, payer, and user
- reports identify who requested, performed, billed, claimed, reconciled, or left work pending
- unresolved operational and financial leakages are easy to escalate
