package com.structurehealth.reporting.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
public class ServiceHealthController {

    @GetMapping("/api/v1/service/health")
    public HealthResponse health() {
        return new HealthResponse("reporting-compliance-service", "online", Instant.now());
    }

    public record HealthResponse(
            String service,
            String status,
            Instant timestamp
    ) {
    }
}
