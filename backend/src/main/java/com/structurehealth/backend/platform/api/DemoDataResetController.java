package com.structurehealth.backend.platform.api;

import com.structurehealth.backend.platform.application.DemoDataResetService;
import com.structurehealth.backend.platform.application.DemoResetSummary;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform/demo")
public class DemoDataResetController {

    private final DemoDataResetService demoDataResetService;

    public DemoDataResetController(DemoDataResetService demoDataResetService) {
        this.demoDataResetService = demoDataResetService;
    }

    @PostMapping("/reset")
    public DemoResetSummary reset(Authentication authentication) {
        String username = authentication == null ? "system" : authentication.getName();
        return demoDataResetService.resetDemoData(username);
    }
}
