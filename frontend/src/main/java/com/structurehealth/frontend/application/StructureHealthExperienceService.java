package com.structurehealth.frontend.application;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StructureHealthExperienceService {

    public AboutAppView aboutAppView() {
        return new AboutAppView(
                "Structure Health is organized around the real care journey so patient services, clinical teams, hospital administration, HMOs, finance, regulators, and patients themselves all work from the same flow. The patient portal extends that journey with encounter history, secure messaging, voice or video consultation, and calendar-aware follow-up.",
                List.of(
                        new SummaryMetric("Journey coverage", "8 connected stages", "Identity, care, billing, claims, reconciliation, follow-up, and reporting stay linked."),
                        new SummaryMetric("Core workspaces", "8 modules", "Patient-facing, clinical, administrative, HMO, finance, and governance workspaces are structured intentionally."),
                        new SummaryMetric("Patient engagement", "Portal + messaging + virtual care", "Patients can review encounters, message the hospital, and attend scheduled voice or video consultations."),
                        new SummaryMetric("Reporting model", "Clinical by patient, admin by accountability", "Clinical reporting follows the patient, while administrative reporting tracks service status and ownership.")
                ),
                List.of(
                        new QuickAction("Register patient", "Patient services desk", "Create the patient identity, guarantor details, and route the patient into care."),
                        new QuickAction("Open encounter", "Clinician or triage nurse", "Start the consultation, triage, or admission workflow from one encounter timeline."),
                        new QuickAction("Route departments", "Care coordinator", "Send tasks to diagnostics, pharmacy, ward, theatre, or discharge."),
                        new QuickAction("Send secure message", "Patient portal", "Allow the patient to ask questions or request clarification from the correct hospital team."),
                        new QuickAction("Schedule virtual consult", "Doctor or telehealth desk", "Book a voice or video consultation and sync it to patient and provider calendars."),
                        new QuickAction("Verify HMO cover", "HMO desk or billing", "Validate membership, plan limits, and authorization before claims leakage starts."),
                        new QuickAction("Build claim package", "Hospital billing", "Assemble encounter evidence, charge lines, and payer-ready documentation."),
                        new QuickAction("Close reconciliation", "Finance control", "Resolve variances across patient, hospital, and HMO positions with audit history.")
                ),
                List.of(
                        new JourneyStageCard(
                                "Registration and identity",
                                "Capture patient identity, contact, guarantor, and demographics once.",
                                "Front desk and patient services establish the master record and access scope.",
                                "Match the patient to payer, plan, or self-pay pathway.",
                                "Registration register, payer mix, queue intake report"
                        ),
                        new JourneyStageCard(
                                "Eligibility and appointment",
                                "Review upcoming appointments, referrals, and readiness before care begins.",
                                "Appointments desk and HMO liaison confirm readiness and route the patient correctly.",
                                "Check membership validity, benefit rules, and pre-authorization need.",
                                "Eligibility outcome, referral aging, approval turnaround"
                        ),
                        new JourneyStageCard(
                                "Encounter and care plan",
                                "Move through consultation, triage, admission, and a longitudinal encounter timeline.",
                                "Doctor, nurse, and care coordinator document decisions and next actions in one place.",
                                "Track utilization triggers and approved care pathways.",
                                "Encounter volume, diagnosis mix, handoff compliance"
                        ),
                        new JourneyStageCard(
                                "Diagnostics, pharmacy, and procedures",
                                "Complete ordered tests, drugs, imaging, ward actions, and procedures.",
                                "Operational departments receive tasks, execute them, and update status in sequence.",
                                "Validate covered tests, drugs, and procedure requirements.",
                                "Department queue, turnaround, stock, and utilization reports"
                        ),
                        new JourneyStageCard(
                                "Billing and discharge",
                                "Receive discharge instructions, costs, and next-step guidance.",
                                "Billing, ward administration, and discharge desk close services and financial exposure.",
                                "Confirm payable items, co-pay exposure, and final charge evidence.",
                                "Revenue capture, discharge readiness, unpaid balance report"
                        ),
                        new JourneyStageCard(
                                "Claims and utilization review",
                                "Patient care events become payer-reviewable evidence without re-keying the journey.",
                                "Hospital billing and claims teams package services, evidence, and coded lines.",
                                "Review authorization, approve or pend claims, and manage utilization.",
                                "Claims aging, approval ratio, denial reasons, exception queues"
                        ),
                        new JourneyStageCard(
                                "Reconciliation and settlement",
                                "Financial outcomes stay traceable back to the patient and encounter.",
                                "Finance control, audit, and leadership resolve mismatches and settlement steps.",
                                "Finalize payable positions and preserve audit-ready settlement evidence.",
                                "Variance register, settlement status, recovered revenue, payer exposure"
                        ),
                        new JourneyStageCard(
                                "Patient portal, communication, and virtual follow-up",
                                "Review previous and future encounters, ask questions, join voice or video visits, and receive reminders.",
                                "Patient support desk, telehealth coordinator, and attending doctor manage continuity of care.",
                                "Validate approved virtual follow-up services and continuity-of-care coverage where required.",
                                "Portal engagement, follow-up adherence, virtual consultation outcomes, patient communication SLA"
                        )
                ),
                List.of(
                        new ModuleWorkspace(
                                "patient-admin",
                                "Patient Administration",
                                "The patient entry module for registration, identity governance, coverage readiness, and referral control.",
                                "Journey start",
                                "Patient services and front desk",
                                "Foundation slice",
                                List.of("Patient registry", "Dependants and guarantors", "Coverage verification", "Appointments and referrals", "Admission requests"),
                                List.of("Daily registrations", "State and LGA population mix", "Queue intake and no-show report"),
                                List.of("Patient services", "Hospital admin", "HMO liaison")
                        ),
                        new ModuleWorkspace(
                                "patient-portal",
                                "Patient Portal and Virtual Care",
                                "The patient-facing workspace for encounter history, secure communication, telehealth, reminders, and calendar-aware continuity of care.",
                                "Pre-visit, post-visit, and continuity of care",
                                "Patients, doctors, and patient support teams",
                                "Phase 2 build",
                                List.of("Encounter history", "Upcoming visits and reminders", "Secure messaging", "Voice and video consultations", "Virtual consultation scheduling", "Calendar sync", "Patient reports and discharge documents", "Care plan follow-up"),
                                List.of("Portal engagement", "Follow-up adherence", "Virtual consultation utilization", "Patient communication response-time report"),
                                List.of("Patients", "Doctors", "Patient support", "Telehealth coordinators")
                        ),
                        new ModuleWorkspace(
                                "clinical-flow",
                                "Clinical and Department Flow",
                                "The encounter workspace that coordinates consultation, diagnostics, treatment, pharmacy, admissions, discharge routing, and follow-up instructions.",
                                "In-care orchestration",
                                "Doctors, nurses, and departmental leads",
                                "Phase 2 build",
                                List.of("Triage", "Consultations", "Orders and care plans", "Diagnostics routing", "Pharmacy workflow", "Ward and theatre transfer", "Discharge", "Follow-up instructions"),
                                List.of("Encounter throughput", "Department turnaround", "Clinical handoff compliance", "What was done for the patient by encounter"),
                                List.of("Clinicians", "Nurses", "Diagnostics", "Pharmacy", "Care coordinators")
                        ),
                        new ModuleWorkspace(
                                "hospital-ops",
                                "Hospital Operations",
                                "Administrative control across departments, staffing signals, capacity, service readiness, request status, and revenue protection.",
                                "Operational control",
                                "Hospital administrators",
                                "Phase 2 build",
                                List.of("Department setup", "Queue monitor", "Bed and theatre utilization", "Service readiness", "Service accountability", "Revenue control", "Executive dashboard"),
                                List.of("Department scorecards", "Capacity utilization", "Requested, done, undone, and pending service report", "Billing readiness and leakages"),
                                List.of("Hospital admin", "Department heads", "Operations supervisors")
                        ),
                        new ModuleWorkspace(
                                "hmo-claims",
                                "HMO and Claims",
                                "Manage membership validation, pre-authorization, utilization review, virtual-care approvals, claims intake, and adjudication.",
                                "Financial review",
                                "HMO desk and claims teams",
                                "Phase 3 build",
                                List.of("Member eligibility", "Benefit validation", "Pre-authorization", "Virtual care approval", "Claims inbox", "Medical review", "Decision and remittance"),
                                List.of("Approval turnaround", "Denial reasons", "Utilization variance and SLA report", "Claimed versus unclaimed services"),
                                List.of("HMO claims officers", "Medical reviewers", "Hospital billing teams")
                        ),
                        new ModuleWorkspace(
                                "reconciliation",
                                "Reconciliation and Finance",
                                "Compare patient, hospital, and HMO positions, resolve mismatches, and drive settlement closure with accountable ownership.",
                                "Post-claim control",
                                "Finance control and audit",
                                "Phase 4 build",
                                List.of("Variance engine", "Dispute workbench", "Settlement tracker", "Evidence trail", "Audit log", "Responsible-user trace"),
                                List.of("Variance aging", "Settlement pipeline", "Recovered revenue and payer exposure", "Who billed, claimed, reconciled, or left work pending"),
                                List.of("Hospital finance", "HMO finance", "Auditors")
                        ),
                        new ModuleWorkspace(
                                "reporting",
                                "Reporting, Compliance, and Broadcast",
                                "Publish patient-centred clinical reports, administrative accountability reports, regulatory outputs, and broadcast notices across all organizations.",
                                "Oversight layer",
                                "Compliance leads and ministry analysts",
                                "Phase 5 build",
                                List.of("Patient clinical reports", "Administrative service accountability", "Department reports", "HMO claim packs", "Hospital executive insights", "Compliance alerts", "Broadcast center", "Ministry dashboard"),
                                List.of("Clinical history by patient", "Requested/done/pending/billed/claimed accountability", "Compliance exceptions", "Population health trends", "Cross-organization broadcast acknowledgments"),
                                List.of("Department leads", "Hospital executives", "HMO managers", "Ministry users")
                        ),
                        new ModuleWorkspace(
                                "governance",
                                "Identity and Governance",
                                "Standardize organizations, departments, access levels, audit trails, communication consent, and reference data that every module depends on.",
                                "Platform foundation",
                                "Platform administrators",
                                "Phase 1 build",
                                List.of("Organization registry", "Department registry", "Role templates", "Access control", "Reference data", "Communication consent", "Audit history"),
                                List.of("Access review", "User provisioning", "Master data completeness", "Consent and communication traceability"),
                                List.of("Platform admins", "Security admins", "Auditors")
                        )
                ),
                List.of(
                        new OperationsBoard(
                                "Hospital command board",
                                "Hospital administration",
                                "Track patient movement, service readiness, pending discharge, staffing pressure, and revenue leakage from one view.",
                                List.of("Patients waiting by department", "Beds and theatre utilization", "Services performed but not billed", "Delayed discharges", "Departments below SLA")
                        ),
                        new OperationsBoard(
                                "Department execution board",
                                "Department heads",
                                "Surface what each department needs to complete next so handoffs do not stall the patient journey.",
                                List.of("Open orders by department", "Average turnaround time", "Escalated cases", "Patients ready for next touch point")
                        ),
                        new OperationsBoard(
                                "Patient communications and telehealth board",
                                "Patient support and telehealth team",
                                "Manage secure messages, scheduled virtual visits, missed follow-ups, and communication response times.",
                                List.of("Unanswered patient threads", "Today's virtual consultations", "Missed follow-up appointments", "Escalated portal conversations", "Calendar sync failures")
                        ),
                        new OperationsBoard(
                                "HMO utilization board",
                                "HMO claims and utilization",
                                "Control approvals, requests for more evidence, and cost drift before settlement is finalized.",
                                List.of("Pending authorizations", "Claims waiting review", "High-cost utilization flags", "Denied claims by reason", "Unclaimed but approved services")
                        ),
                        new OperationsBoard(
                                "Finance and reconciliation board",
                                "Finance control",
                                "Monitor unpaid balances, payer exposure, mismatch drivers, and settlement progress across organizations.",
                                List.of("Open reconciliation cases", "Variance by payer", "Settlement aging", "Recovered revenue", "Ownership gaps in billing and claims")
                        ),
                        new OperationsBoard(
                                "Ministry oversight board",
                                "Ministry and compliance",
                                "Aggregate approved health and compliance signals for surveillance, broadcast, and regulatory intervention.",
                                List.of("Regional service volumes", "Disease and diagnosis mix", "Missing reports", "Broadcast acknowledgment status", "National virtual care utilization")
                        )
                ),
                List.of(
                        new ReportDesign(
                                "Patient-centred clinical reporting",
                                "Clinical care and continuity",
                                "Clinical reports are anchored on the patient and every encounter, focusing on what was done, what was found, what was prescribed, what changed, and what follow-up is still required.",
                                List.of("Previous and future encounters by patient", "Diagnoses, observations, orders, results, medications, and procedures", "Who saw the patient, when, and what decision was made", "Discharge plans, follow-up actions, and virtual consultation history")
                        ),
                        new ReportDesign(
                                "Administrative service accountability reporting",
                                "Operational control, finance, and claims",
                                "Administrative reports track service lifecycle and ownership from request to completion, billing, claiming, reconciliation, and exception handling.",
                                List.of("Services requested, done, undone, pending, canceled, billed, unbilled, claimed, and unclaimed", "Who requested, performed, verified, billed, claimed, reconciled, or left work pending", "Department, payer, patient, and user-level accountability views", "Operational and financial bottlenecks that need intervention")
                        )
                ),
                List.of(
                        new ReportPack(
                                "Patient longitudinal clinical pack",
                                "Patients, clinicians, HMOs, and approved regulators",
                                List.of("Chronological encounter history", "What was done for the patient and why", "Findings, medications, procedures, and care outcomes", "Who handled the patient at each touch point", "Future visits, follow-up tasks, and virtual consult history")
                        ),
                        new ReportPack(
                                "Administrative service accountability pack",
                                "Hospital operations, finance, HMO reviewers, and audit",
                                List.of("Requested, done, undone, pending, and canceled services", "Billed versus unbilled services with accountable user", "Claimed versus unclaimed services with accountable user", "Requested, performed, verified, billed, claimed, and reconciled trail")
                        ),
                        new ReportPack(
                                "Department operational pack",
                                "Clinical and operational departments",
                                List.of("Queue volumes", "Turnaround time", "Escalations and bottlenecks", "Completed versus pending orders")
                        ),
                        new ReportPack(
                                "Hospital executive pack",
                                "Hospital leadership",
                                List.of("Admissions and discharge flow", "Revenue captured versus outstanding", "Department scorecards", "Payer mix and case load")
                        ),
                        new ReportPack(
                                "HMO claims and utilization pack",
                                "HMO operations",
                                List.of("Authorization turnaround", "Claim aging", "Approval and denial rates", "Utilization exceptions", "Approved but unclaimed services")
                        ),
                        new ReportPack(
                                "Ministry oversight pack",
                                "Regulators and public health teams",
                                List.of("Facility activity trends", "Regional case mix", "Compliance breaches", "Broadcast effectiveness", "Patient pathway and service utilization trends")
                        )
                ),
                List.of(
                        new RoleWorkspace(
                                "Patient portal workspace",
                                "Patients and dependants",
                                List.of("Review previous and upcoming encounters", "Message the hospital securely", "Join scheduled voice or video consultations", "Receive reports, prescriptions, discharge documents, and follow-up reminders")
                        ),
                        new RoleWorkspace(
                                "Patient services desk",
                                "Front desk teams",
                                List.of("Register new and returning patients", "Collect guarantor and coverage data", "Route the patient into the correct journey entry point")
                        ),
                        new RoleWorkspace(
                                "Clinical workspace",
                                "Doctors and nurses",
                                List.of("Review patient timeline and portal messages", "Capture notes, orders, and treatment decisions", "Track what the next department still owes the patient", "Schedule follow-up and virtual consultations")
                        ),
                        new RoleWorkspace(
                                "Hospital administration workspace",
                                "Operations leaders",
                                List.of("Monitor queues, staffing, and service readiness", "Intervene on bottlenecks", "Watch billing, discharge, and service accountability status")
                        ),
                        new RoleWorkspace(
                                "HMO claims workspace",
                                "HMO claims officers",
                                List.of("Check eligibility and plan rules", "Review pre-authorizations and claims", "Assess patient-centred clinical evidence and utilization exceptions")
                        ),
                        new RoleWorkspace(
                                "Finance control workspace",
                                "Hospital and HMO finance",
                                List.of("Compare financial positions", "Resolve variances with evidence", "Prepare settlement closure and audit output", "Track who completed or missed each financial action")
                        ),
                        new RoleWorkspace(
                                "Ministry analyst workspace",
                                "Regulators and ministry users",
                                List.of("Monitor national and regional signals", "Review compliance alerts", "Send targeted broadcasts and policy notices", "Study patient-level and service-level utilization patterns within approved scope")
                        )
                )
        );
    }

    public record AboutAppView(
            String mission,
            List<SummaryMetric> metrics,
            List<QuickAction> quickActions,
            List<JourneyStageCard> journeyStages,
            List<ModuleWorkspace> modules,
            List<OperationsBoard> operationsBoards,
            List<ReportDesign> reportDesigns,
            List<ReportPack> reportPacks,
            List<RoleWorkspace> roleWorkspaces
    ) {
    }

    public record SummaryMetric(String label, String value, String detail) {
    }

    public record QuickAction(String title, String owner, String description) {
    }

    public record JourneyStageCard(
            String title,
            String patientTouchpoint,
            String hospitalTouchpoint,
            String hmoTouchpoint,
            String reportOutput
    ) {
    }

    public record ModuleWorkspace(
            String key,
            String title,
            String description,
            String lifecyclePosition,
            String primaryOwner,
            String deliveryStatus,
            List<String> submodules,
            List<String> reportingOutputs,
            List<String> users
    ) {
    }

    public record OperationsBoard(
            String title,
            String audience,
            String summary,
            List<String> signals
    ) {
    }

    public record ReportDesign(
            String title,
            String orientation,
            String summary,
            List<String> focusAreas
    ) {
    }

    public record ReportPack(
            String title,
            String audience,
            List<String> outputs
    ) {
    }

    public record RoleWorkspace(
            String title,
            String audience,
            List<String> responsibilities
    ) {
    }

}
