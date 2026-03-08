package com.structurehealth.backend.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SinglePageApplicationController {

    @GetMapping({"/", "/journey", "/modules", "/reporting"})
    public String index() {
        return "forward:/index.html";
    }
}
