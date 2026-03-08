# Structure Health Workflows

## Workflow 1: Patient Registration to Care Delivery

1. Patient is registered once and assigned a global patient identifier.
2. Coverage is checked against HMO or insurance records.
3. The patient is queued for triage, consultation, diagnostics, pharmacy, admission, or discharge as needed.
4. Every departmental action updates the encounter timeline.
5. Billing events are generated from approved services.
6. The encounter closes only when clinical, operational, and billing tasks are complete.
7. The patient receives encounter summaries, follow-up instructions, and future appointments through the portal.

Primary actors:

- Patient
- Front desk
- Clinician
- Nurse
- Diagnostics
- Pharmacy
- Billing team

## Workflow 2: Patient Portal, Messaging, and Virtual Consultation

1. The patient signs into the portal and reviews previous encounters, future appointments, reports, and follow-up instructions.
2. The patient sends a secure message or request to the hospital.
3. The hospital routes the request to the right clinical, administrative, or support team.
4. If a remote review is appropriate, a voice or video consultation is scheduled.
5. The consultation is synchronized to calendars and reminder notifications are sent automatically.
6. Consultation outcomes, instructions, and next steps are attached back to the patient record.

Primary actors:

- Patient
- Patient support desk
- Clinician
- Telehealth coordinator

## Workflow 3: Hospital Claim Submission

1. The hospital billing team assembles the claim from encounter evidence.
2. The system validates payer plan, authorizations, and coded charge items.
3. The HMO receives the claim package with status `submitted`.
4. The HMO reviews and either approves, partially approves, denies, or requests more evidence.
5. The hospital resolves exceptions and resubmits if needed.
6. Once finalized, the claim moves to settlement and reconciliation.

Primary actors:

- Hospital billing officer
- HMO claims officer
- HMO medical reviewer
- Finance analyst

## Workflow 4: Automated Reconciliation

1. Patient charges, hospital billing totals, and HMO approved amounts are compared automatically.
2. Variances are grouped into reconciliation cases.
3. Cases are routed to the correct hospital and HMO teams.
4. Supporting evidence, comments, and adjustments are logged against the case.
5. Approved reconciliation outcomes update the settlement record.
6. Unresolved cases feed escalation and audit dashboards.

Primary actors:

- Hospital finance
- HMO finance
- Platform reconciliation engine
- Auditor

## Workflow 5: Ministry Monitoring and Compliance

1. Facilities and HMOs submit or generate approved operational data.
2. The analytics layer aggregates trends by hospital, state, specialty, disease area, and payer.
3. Compliance rules evaluate missing reports, abnormal patterns, and policy breaches.
4. Ministry users review dashboards and trigger follow-up actions.
5. Broadcast notices can be sent to affected institutions or all users.

Primary actors:

- Ministry analyst
- Ministry regulator
- Hospital compliance lead
- HMO compliance lead

## Workflow 6: Access Governance

1. Platform admin creates an organization and department structure.
2. Users are assigned role, organization, department, and scope.
3. Policies determine which modules, records, and actions are visible.
4. Sensitive actions create audit events automatically.
5. Access reviews and revocations are handled centrally.

Primary actors:

- Platform administrator
- Security administrator
- Auditor

## Delivery Interpretation

The first production slice should cover end-to-end value rather than isolated screens:

1. Organization and user onboarding
2. Patient registration, portal access, and encounter creation
3. Secure messaging and virtual consultation scheduling
4. Claim preparation and HMO review
5. Reconciliation case generation
6. Ministry dashboard and broadcast center
