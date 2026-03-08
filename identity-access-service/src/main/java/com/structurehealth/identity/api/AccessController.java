package com.structurehealth.identity.api;

import com.structurehealth.identity.application.AccessService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AccessController {

    private final AccessService accessService;

    public AccessController(AccessService accessService) {
        this.accessService = accessService;
    }

    @GetMapping("/api/v1/access/me")
    public AccessService.AuthenticatedUserResponse me(Authentication authentication) {
        return accessService.me(authentication);
    }

    @GetMapping("/api/v1/access/organizations")
    public List<AccessService.OrganizationSummary> organizations() {
        return accessService.organizations();
    }

    @GetMapping("/api/v1/access/workspaces")
    public List<AccessService.WorkspaceSummary> workspaces() {
        return accessService.workspaces();
    }
}
