package com.structurehealth.reporting.api;

import com.structurehealth.reporting.application.ReportingComplianceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReportingComplianceController {

    private final ReportingComplianceService reportingComplianceService;

    public ReportingComplianceController(ReportingComplianceService reportingComplianceService) {
        this.reportingComplianceService = reportingComplianceService;
    }

    @GetMapping("/api/v1/reporting/overview")
    public ReportingComplianceService.OverviewResponse overview() {
        return reportingComplianceService.overview();
    }
}
