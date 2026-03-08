package com.structurehealth.billing.api;

import com.structurehealth.billing.application.BillingClaimsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class BillingClaimsController {

    private final BillingClaimsService billingClaimsService;

    public BillingClaimsController(BillingClaimsService billingClaimsService) {
        this.billingClaimsService = billingClaimsService;
    }

    @GetMapping("/api/v1/claims")
    public List<BillingClaimsService.ClaimSummary> claims() {
        return billingClaimsService.claims();
    }

    @PostMapping("/api/v1/claims")
    public BillingClaimsService.ClaimSummary createClaim(
            @Valid @RequestBody BillingClaimsService.CreateClaimRequest request
    ) {
        return billingClaimsService.createClaim(request);
    }

    @PatchMapping("/api/v1/claims/{claimId}")
    public BillingClaimsService.ClaimSummary updateClaim(
            @PathVariable("claimId") UUID claimId,
            @Valid @RequestBody BillingClaimsService.UpdateClaimDecisionRequest request
    ) {
        return billingClaimsService.updateClaim(claimId, request);
    }

    @GetMapping("/api/v1/reconciliations")
    public List<BillingClaimsService.ReconciliationSummary> reconciliations() {
        return billingClaimsService.reconciliations();
    }
}
