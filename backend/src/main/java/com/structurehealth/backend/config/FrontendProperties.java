package com.structurehealth.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "structure-health.frontend")
public class FrontendProperties {

    private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:6070", "http://localhost:6060"));

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
}
