package com.structurehealth.frontend.web;

import com.structurehealth.frontend.application.StructureHealthExperienceService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StructureHealthController {

    private final StructureHealthExperienceService experienceService;

    public StructureHealthController(StructureHealthExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping("/")
    public String aboutApp(Model model) {
        model.addAttribute("view", experienceService.aboutAppView());
        model.addAttribute("activePage", "about-app");
        return "about-app";
    }

    @GetMapping("/about")
    public String legacyAbout() {
        return "redirect:/";
    }
}
