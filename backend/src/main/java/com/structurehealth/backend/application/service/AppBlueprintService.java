package com.structurehealth.backend.application.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppBlueprintService {

    public AppBlueprintResponse blueprint() {
        return new AppBlueprintResponse(
                "Structure Health",
                "The platform is organized around the patient journey so care delivery, hospital administration, patient engagement, HMO workflows, claims, reconciliation, and oversight all operate from the same governed flow.",
                List.of(
                        new JourneyStageSummary("Registration and identity", "Patient services", "Patient identity, guarantor, and demographic data are captured once and governed centrally."),
                        new JourneyStageSummary("Eligibility and appointment", "HMO desk and appointments", "Coverage, referral, and authorization readiness are validated before care."),
                        new JourneyStageSummary("Encounter and departmental care", "Clinicians and departments", "Consultation, diagnostics, pharmacy, ward, and theatre activities move through one encounter."),
                        new JourneyStageSummary("Billing and discharge", "Billing and ward admin", "Services, balances, and discharge readiness stay aligned."),
                        new JourneyStageSummary("Claims and utilization review", "Hospital billing and HMO claims", "Claim submission and medical review stay tied to encounter evidence."),
                        new JourneyStageSummary("Reconciliation and settlement", "Finance and audit", "Variance resolution and settlement remain traceable to patient-level activity."),
                        new JourneyStageSummary("Patient portal and virtual follow-up", "Patient support and telehealth", "Patients review encounters, message the hospital, and join scheduled voice or video consultations.")
                ),
                List.of(
                        new ModuleSummary(
                                "patient-administration",
                                "Patient Administration",
                                List.of("Patient registry", "Dependants and guarantors", "Coverage verification", "Appointments and referrals", "Admission requests")
                        ),
                        new ModuleSummary(
                                "patient-portal-virtual-care",
                                "Patient Portal and Virtual Care",
                                List.of("Encounter history", "Upcoming visits and reminders", "Secure messaging", "Voice and video consultations", "Virtual consultation scheduling", "Calendar sync", "Patient reports and discharge documents")
                        ),
                        new ModuleSummary(
                                "clinical-department-flow",
                                "Clinical and Department Flow",
                                List.of("Triage", "Consultations", "Orders and care plans", "Diagnostics routing", "Pharmacy workflow", "Ward and theatre transfer", "Discharge", "Follow-up instructions")
                        ),
                        new ModuleSummary(
                                "hospital-operations",
                                "Hospital Operations",
                                List.of("Department setup", "Queue monitor", "Bed and theatre utilization", "Service readiness", "Service accountability", "Revenue control", "Executive dashboard")
                        ),
                        new ModuleSummary(
                                "hmo-claims",
                                "HMO and Claims",
                                List.of("Member eligibility", "Benefit validation", "Pre-authorization", "Virtual care approval", "Claims inbox", "Medical review", "Decision and remittance")
                        ),
                        new ModuleSummary(
                                "reconciliation-finance",
                                "Reconciliation and Finance",
                                List.of("Variance engine", "Dispute workbench", "Settlement tracker", "Evidence trail", "Audit log", "Responsible-user trace")
                        ),
                        new ModuleSummary(
                                "reporting-compliance",
                                "Reporting, Compliance, and Broadcast",
                                List.of("Patient clinical reports", "Administrative service accountability", "Department reports", "Hospital executive insights", "HMO claim packs", "Compliance alerts", "Broadcast center", "Ministry dashboard")
                        ),
                        new ModuleSummary(
                                "identity-governance",
                                "Identity and Governance",
                                List.of("Organization registry", "Department registry", "Role templates", "Access control", "Reference data", "Communication consent", "Audit history")
                        )
                ),
                List.of(
                        new ReportingModel(
                                "Patient-centred clinical reporting",
                                "Clinical care and continuity",
                                List.of("What was done for the patient", "Findings, medications, procedures, and outcomes", "Who handled the patient and when", "Future appointments and follow-up history")
                        ),
                        new ReportingModel(
                                "Administrative service accountability reporting",
                                "Operational control, finance, and claims",
                                List.of("Requested, done, undone, pending, billed, unbilled, claimed, and unclaimed services", "Who requested, performed, verified, billed, claimed, or reconciled", "Department, payer, patient, and user-level accountability views", "Operational bottlenecks and leakages")
                        )
                ),
                List.of(
                        new ReportAudience("Patients and clinicians", List.of("Longitudinal encounter history", "What was done, findings, medications, and follow-up")),
                        new ReportAudience("Hospital operations and finance", List.of("Requested versus done services", "Billed versus unbilled services", "Who completed or missed each action")),
                        new ReportAudience("HMO operations", List.of("Authorization turnaround", "Claims aging", "Denied, approved, and unclaimed services")),
                        new ReportAudience("Finance control", List.of("Variance aging", "Settlement status", "Recovered revenue", "Ownership gaps")),
                        new ReportAudience("Ministry analysts", List.of("Regional activity trends", "Compliance breaches", "Broadcast acknowledgments", "Patient-pathway utilization trends"))
                )
        );
    }

    public record AppBlueprintResponse(
            String platformName,
            String mission,
            List<JourneyStageSummary> journeyStages,
            List<ModuleSummary> modules,
            List<ReportingModel> reportingModels,
            List<ReportAudience> reportAudiences
    ) {
    }

    public record JourneyStageSummary(
            String title,
            String owner,
            String outcome
    ) {
    }

    public record ModuleSummary(
            String key,
            String title,
            List<String> submodules
    ) {
    }

    public record ReportingModel(
            String title,
            String orientation,
            List<String> focusAreas
    ) {
    }

    public record ReportAudience(
            String audience,
            List<String> reports
    ) {
    }
}
