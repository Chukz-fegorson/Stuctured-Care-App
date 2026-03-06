package com.structurehealth.backend.platform.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformHealthController {

    @GetMapping("/health")
    public PlatformHealthResponse health() {
        return new PlatformHealthResponse(
                "Structure Health backend is online",
                Instant.now(),
                List.of(
                        "identity-access",
                        "patient-records",
                        "billing-claims",
                        "reconciliation-settlement",
                        "ministry-reporting"
                )
        );
    }

    public record PlatformHealthResponse(
            String message,
            Instant timestamp,
            List<String> boundedContexts
    ) {
    }
}

