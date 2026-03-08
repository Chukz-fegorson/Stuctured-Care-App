package com.structurehealth.care.api;

import com.structurehealth.care.application.CareFlowService;
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
public class CareFlowController {

    private final CareFlowService careFlowService;

    public CareFlowController(CareFlowService careFlowService) {
        this.careFlowService = careFlowService;
    }

    @GetMapping("/api/v1/encounters")
    public List<CareFlowService.EncounterSummary> encounters() {
        return careFlowService.encounters();
    }

    @GetMapping("/api/v1/care-board")
    public CareFlowService.CareBoard board() {
        return careFlowService.board();
    }

    @GetMapping("/api/v1/encounters/{encounterId}/documentation")
    public CareFlowService.EncounterDocumentationSummary encounterDocumentation(
            @PathVariable("encounterId") UUID encounterId
    ) {
        return careFlowService.encounterDocumentation(encounterId);
    }

    @PostMapping("/api/v1/encounters")
    public CareFlowService.EncounterSummary createEncounter(
            @Valid @RequestBody CareFlowService.CreateEncounterRequest request
    ) {
        return careFlowService.createEncounter(request);
    }

    @PatchMapping("/api/v1/encounters/{encounterId}")
    public CareFlowService.EncounterSummary updateEncounter(
            @PathVariable("encounterId") UUID encounterId,
            @Valid @RequestBody CareFlowService.UpdateEncounterRequest request
    ) {
        return careFlowService.updateEncounter(encounterId, request);
    }

    @PostMapping("/api/v1/triage")
    public CareFlowService.TriageSummary upsertTriage(
            @Valid @RequestBody CareFlowService.UpsertTriageRequest request
    ) {
        return careFlowService.upsertTriage(request);
    }

    @PostMapping("/api/v1/consultations")
    public CareFlowService.ConsultationSummary upsertConsultation(
            @Valid @RequestBody CareFlowService.UpsertConsultationRequest request
    ) {
        return careFlowService.upsertConsultation(request);
    }

    @PostMapping("/api/v1/encounter-documentation")
    public CareFlowService.EncounterDocumentationSummary upsertEncounterDocumentation(
            @Valid @RequestBody CareFlowService.UpsertEncounterDocumentationRequest request
    ) {
        return careFlowService.upsertEncounterDocumentation(request);
    }

    @PostMapping("/api/v1/tasks")
    public CareFlowService.DepartmentTaskSummary createTask(
            @Valid @RequestBody CareFlowService.CreateTaskRequest request
    ) {
        return careFlowService.createTask(request);
    }

    @PatchMapping("/api/v1/tasks/{taskId}")
    public CareFlowService.DepartmentTaskSummary updateTask(
            @PathVariable("taskId") UUID taskId,
            @Valid @RequestBody CareFlowService.UpdateTaskRequest request
    ) {
        return careFlowService.updateTask(taskId, request);
    }

    @PostMapping("/api/v1/discharges")
    public CareFlowService.DischargeSummary upsertDischarge(
            @Valid @RequestBody CareFlowService.UpsertDischargeRequest request
    ) {
        return careFlowService.upsertDischarge(request);
    }

    @GetMapping("/api/v1/inventory")
    public List<CareFlowService.InventoryItemSummary> inventoryItems() {
        return careFlowService.inventoryItems();
    }

    @PostMapping("/api/v1/inventory")
    public CareFlowService.InventoryItemSummary createInventoryItem(
            @Valid @RequestBody CareFlowService.CreateInventoryItemRequest request
    ) {
        return careFlowService.createInventoryItem(request);
    }

    @GetMapping("/api/v1/inventory/movements")
    public List<CareFlowService.InventoryMovementSummary> inventoryMovements() {
        return careFlowService.inventoryMovements();
    }

    @PostMapping("/api/v1/inventory/movements")
    public CareFlowService.InventoryMovementSummary recordInventoryMovement(
            @Valid @RequestBody CareFlowService.RecordInventoryMovementRequest request
    ) {
        return careFlowService.recordInventoryMovement(request);
    }
}
