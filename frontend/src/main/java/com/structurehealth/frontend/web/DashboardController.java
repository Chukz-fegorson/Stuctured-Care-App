package com.structurehealth.frontend.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class DashboardController {

    @GetMapping("/")
    public String dashboard(Model model) {
        model.addAttribute("capabilities", List.of(
                new CapabilityCard("Patient Journey", "Registration, triage, consultation, diagnostics, pharmacy, discharge, and longitudinal patient history."),
                new CapabilityCard("Hospital Operations", "Department throughput, staffing signals, billing readiness, and service quality dashboards."),
                new CapabilityCard("HMO and Claims", "Eligibility, pre-authorization, claims review, settlement, and exception handling."),
                new CapabilityCard("Ministry Oversight", "Health monitoring, compliance, broadcast, and national decision-support dashboards.")
        ));

        model.addAttribute("workflows", List.of(
                new WorkflowCard(
                        "care",
                        "Patient Care Flow",
                        List.of("Register patient", "Verify coverage", "Open encounter", "Route tasks by department", "Close encounter and bill")
                ),
                new WorkflowCard(
                        "claims",
                        "Claims and Reconciliation",
                        List.of("Assemble claim package", "Review by HMO", "Flag variances", "Resolve disputes", "Close settlement")
                ),
                new WorkflowCard(
                        "governance",
                        "Compliance and Monitoring",
                        List.of("Aggregate operational signals", "Evaluate compliance rules", "Review ministry dashboard", "Broadcast directives", "Track acknowledgments")
                )
        ));

        model.addAttribute("phases", List.of(
                "Phase 1: identity, organizations, departments, and reference data",
                "Phase 2: patient administration and encounter workflows",
                "Phase 3: billing, payer operations, and claims",
                "Phase 4: reconciliation, finance controls, and ministry reporting"
        ));

        return "dashboard";
    }

    public record CapabilityCard(String title, String description) {
    }

    public record WorkflowCard(String key, String title, List<String> steps) {
    }
}

