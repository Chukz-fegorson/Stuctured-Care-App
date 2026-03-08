package com.structurehealth.backend.application.api;

import com.structurehealth.backend.application.service.AppBlueprintService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/app")
public class AppBlueprintController {

    private final AppBlueprintService appBlueprintService;

    public AppBlueprintController(AppBlueprintService appBlueprintService) {
        this.appBlueprintService = appBlueprintService;
    }

    @GetMapping("/blueprint")
    public AppBlueprintService.AppBlueprintResponse blueprint() {
        return appBlueprintService.blueprint();
    }
}
