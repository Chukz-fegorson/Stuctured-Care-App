package com.structurehealth.care.application;

import com.structurehealth.shared.domain.support.SeedDataIds;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CareFlowService {

    private final JdbcTemplate jdbcTemplate;

    public CareFlowService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<EncounterSummary> encounters() {
        return jdbcTemplate.query(
                encounterSelect() + " order by e.opened_at desc",
                (rs, rowNum) -> new EncounterSummary(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("clinician_name"),
                        rs.getString("journey_stage"),
                        rs.getString("status"),
                        rs.getTimestamp("opened_at").toLocalDateTime(),
                        rs.getTimestamp("closed_at") == null ? null : rs.getTimestamp("closed_at").toLocalDateTime()
                )
        );
    }

    public EncounterSummary createEncounter(CreateEncounterRequest request) {
        UUID encounterId = UUID.randomUUID();
        jdbcTemplate.update(
                "insert into encounter (id, patient_id, hospital_id, attending_user_id, journey_stage, status, opened_at, closed_at) " +
                        "values (?, ?, ?, ?, ?, ?, ?, null)",
                uuidValue(encounterId),
                uuidValue(request.patientId()),
                uuidValue(SeedDataIds.HOSPITAL_ID),
                uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                normalizeStage(request.journeyStage()),
                defaultedStatus(request.status()),
                Timestamp.valueOf(LocalDateTime.now())
        );

        return fetchEncounter(encounterId);
    }

    public EncounterSummary updateEncounter(UUID encounterId, UpdateEncounterRequest request) {
        EncounterSummary current = fetchEncounter(encounterId);
        String nextStage = request.journeyStage() == null || request.journeyStage().isBlank()
                ? current.journeyStage()
                : normalizeStage(request.journeyStage());
        String nextStatus = request.status() == null || request.status().isBlank()
                ? current.status()
                : request.status().trim().toUpperCase(Locale.ROOT);
        Timestamp closedAt = "CLOSED".equalsIgnoreCase(nextStatus)
                ? Timestamp.valueOf(LocalDateTime.now())
                : null;

        jdbcTemplate.update(
                "update encounter set journey_stage = ?, status = ?, closed_at = ? where id = ?",
                nextStage,
                nextStatus,
                closedAt,
                uuidValue(encounterId)
        );

        return fetchEncounter(encounterId);
    }

    public CareBoard board() {
        return new CareBoard(
                encounters(),
                triageAssessments(),
                consultationNotes(),
                encounterDocumentation(),
                departmentTasks(),
                dischargePlans(),
                inventoryItems(),
                inventoryMovements()
        );
    }

    public TriageSummary upsertTriage(UpsertTriageRequest request) {
        fetchEncounter(request.encounterId());

        if (exists("triage_assessment", request.encounterId())) {
            jdbcTemplate.update(
                    "update triage_assessment set recorded_by_user_id = ?, acuity_level = ?, chief_complaint = ?, " +
                            "temperature_c = ?, systolic_bp = ?, diastolic_bp = ?, heart_rate = ?, respiratory_rate = ?, " +
                            "oxygen_saturation = ?, weight_kg = ?, notes = ?, recorded_at = current_timestamp where encounter_id = ?",
                    uuidValue(SeedDataIds.NURSE_USER_ID),
                    request.acuityLevel().trim().toUpperCase(Locale.ROOT),
                    request.chiefComplaint().trim(),
                    request.temperatureC(),
                    request.systolicBp(),
                    request.diastolicBp(),
                    request.heartRate(),
                    request.respiratoryRate(),
                    request.oxygenSaturation(),
                    request.weightKg(),
                    nullableText(request.notes()),
                    uuidValue(request.encounterId())
            );
        } else {
            jdbcTemplate.update(
                    "insert into triage_assessment (id, encounter_id, recorded_by_user_id, acuity_level, chief_complaint, " +
                            "temperature_c, systolic_bp, diastolic_bp, heart_rate, respiratory_rate, oxygen_saturation, weight_kg, notes) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    uuidValue(UUID.randomUUID()),
                    uuidValue(request.encounterId()),
                    uuidValue(SeedDataIds.NURSE_USER_ID),
                    request.acuityLevel().trim().toUpperCase(Locale.ROOT),
                    request.chiefComplaint().trim(),
                    request.temperatureC(),
                    request.systolicBp(),
                    request.diastolicBp(),
                    request.heartRate(),
                    request.respiratoryRate(),
                    request.oxygenSaturation(),
                    request.weightKg(),
                    nullableText(request.notes())
            );
        }

        jdbcTemplate.update(
                "update encounter set journey_stage = 'TRIAGE', status = 'IN_PROGRESS', attending_user_id = ? where id = ?",
                uuidValue(SeedDataIds.NURSE_USER_ID),
                uuidValue(request.encounterId())
        );

        return fetchTriage(request.encounterId());
    }

    public ConsultationSummary upsertConsultation(UpsertConsultationRequest request) {
        fetchEncounter(request.encounterId());

        if (exists("consultation_note", request.encounterId())) {
            jdbcTemplate.update(
                    "update consultation_note set clinician_user_id = ?, diagnosis = ?, clinical_notes = ?, care_plan = ?, " +
                            "follow_up_instruction = ?, recorded_at = current_timestamp where encounter_id = ?",
                    uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                    request.diagnosis().trim(),
                    request.clinicalNotes().trim(),
                    nullableText(request.carePlan()),
                    nullableText(request.followUpInstruction()),
                    uuidValue(request.encounterId())
            );
        } else {
            jdbcTemplate.update(
                    "insert into consultation_note (id, encounter_id, clinician_user_id, diagnosis, clinical_notes, care_plan, follow_up_instruction) " +
                            "values (?, ?, ?, ?, ?, ?, ?)",
                    uuidValue(UUID.randomUUID()),
                    uuidValue(request.encounterId()),
                    uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                    request.diagnosis().trim(),
                    request.clinicalNotes().trim(),
                    nullableText(request.carePlan()),
                    nullableText(request.followUpInstruction())
            );
        }

        jdbcTemplate.update(
                "update encounter set journey_stage = 'CONSULTATION', status = 'IN_PROGRESS', attending_user_id = ? where id = ?",
                uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                uuidValue(request.encounterId())
        );

        return fetchConsultation(request.encounterId());
    }

    public EncounterDocumentationSummary encounterDocumentation(UUID encounterId) {
        fetchEncounter(encounterId);
        return fetchEncounterDocumentation(encounterId);
    }

    public EncounterDocumentationSummary upsertEncounterDocumentation(UpsertEncounterDocumentationRequest request) {
        fetchEncounter(request.encounterId());

        if (exists("encounter_documentation", request.encounterId())) {
            jdbcTemplate.update(
                    "update encounter_documentation set documented_by_user_id = ?, patient_history = ?, subjective_notes = ?, " +
                            "objective_findings = ?, assessment_notes = ?, care_plan_notes = ?, medication_plan = ?, " +
                            "safety_flags = ?, next_step_notes = ?, updated_at = current_timestamp where encounter_id = ?",
                    uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                    nullableText(request.patientHistory()),
                    request.subjectiveNotes().trim(),
                    request.objectiveFindings().trim(),
                    request.assessmentNotes().trim(),
                    request.carePlanNotes().trim(),
                    nullableText(request.medicationPlan()),
                    nullableText(request.safetyFlags()),
                    nullableText(request.nextStepNotes()),
                    uuidValue(request.encounterId())
            );
        } else {
            jdbcTemplate.update(
                    "insert into encounter_documentation (id, encounter_id, documented_by_user_id, patient_history, subjective_notes, " +
                            "objective_findings, assessment_notes, care_plan_notes, medication_plan, safety_flags, next_step_notes) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    uuidValue(UUID.randomUUID()),
                    uuidValue(request.encounterId()),
                    uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                    nullableText(request.patientHistory()),
                    request.subjectiveNotes().trim(),
                    request.objectiveFindings().trim(),
                    request.assessmentNotes().trim(),
                    request.carePlanNotes().trim(),
                    nullableText(request.medicationPlan()),
                    nullableText(request.safetyFlags()),
                    nullableText(request.nextStepNotes())
            );
        }

        jdbcTemplate.update(
                "update encounter set journey_stage = 'CONSULTATION', status = 'IN_PROGRESS', attending_user_id = ? where id = ?",
                uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                uuidValue(request.encounterId())
        );

        return fetchEncounterDocumentation(request.encounterId());
    }

    public DepartmentTaskSummary createTask(CreateTaskRequest request) {
        EncounterSummary encounter = fetchEncounter(request.encounterId());
        UUID taskId = UUID.randomUUID();
        UUID inventoryItemId = request.inventoryItemId();
        BigDecimal quantityRequested = request.quantityRequested();

        if (inventoryItemId != null) {
            fetchInventoryItem(inventoryItemId);
        }

        jdbcTemplate.update(
                "insert into department_task (id, encounter_id, patient_id, department_type, task_title, task_details, task_status, " +
                        "requested_by_user_id, assigned_to_user_id, inventory_item_id, quantity_requested, updated_at) " +
                        "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)",
                uuidValue(taskId),
                uuidValue(request.encounterId()),
                uuidValue(encounter.patientId()),
                request.departmentType().trim().toUpperCase(Locale.ROOT),
                request.taskTitle().trim(),
                nullableText(request.taskDetails()),
                "REQUESTED",
                uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                uuidValue(defaultAssignee(request.departmentType())),
                uuidValueOrNull(inventoryItemId),
                quantityRequested
        );

        jdbcTemplate.update(
                "update encounter set journey_stage = ?, status = 'IN_PROGRESS' where id = ?",
                normalizeStage(request.departmentType()),
                uuidValue(request.encounterId())
        );

        return fetchTask(taskId);
    }

    public DepartmentTaskSummary updateTask(UUID taskId, UpdateTaskRequest request) {
        DepartmentTaskSummary current = fetchTask(taskId);
        String nextStatus = request.taskStatus() == null || request.taskStatus().isBlank()
                ? current.taskStatus()
                : request.taskStatus().trim().toUpperCase(Locale.ROOT);
        String nextDetails = request.taskDetails() == null || request.taskDetails().isBlank()
                ? current.taskDetails()
                : request.taskDetails().trim();
        UUID nextAssignee = request.assignedToUserId() == null ? current.assignedToUserId() : request.assignedToUserId();
        UUID nextInventoryItemId = request.inventoryItemId() == null ? current.inventoryItemId() : request.inventoryItemId();
        BigDecimal nextQuantity = request.quantityRequested() == null ? current.quantityRequested() : request.quantityRequested();

        if (nextInventoryItemId != null) {
            fetchInventoryItem(nextInventoryItemId);
        }

        jdbcTemplate.update(
                "update department_task set task_status = ?, task_details = ?, assigned_to_user_id = ?, inventory_item_id = ?, " +
                        "quantity_requested = ?, updated_at = current_timestamp where id = ?",
                nextStatus,
                nullableText(nextDetails),
                uuidValueOrNull(nextAssignee),
                uuidValueOrNull(nextInventoryItemId),
                nextQuantity,
                uuidValue(taskId)
        );

        if (!isConsumptiveStatus(current.taskStatus()) && isConsumptiveStatus(nextStatus) && nextInventoryItemId != null && hasPositiveQuantity(nextQuantity)) {
            issueInventory(nextInventoryItemId, nextQuantity, "DEPARTMENT_TASK", taskId, current.taskTitle());
        }

        return fetchTask(taskId);
    }

    public DischargeSummary upsertDischarge(UpsertDischargeRequest request) {
        fetchEncounter(request.encounterId());

        if (exists("discharge_plan", request.encounterId())) {
            jdbcTemplate.update(
                    "update discharge_plan set discharge_status = ?, disposition = ?, summary_notes = ?, medication_notes = ?, " +
                            "follow_up_date = ?, discharged_by_user_id = ?, updated_at = current_timestamp where encounter_id = ?",
                    request.dischargeStatus().trim().toUpperCase(Locale.ROOT),
                    request.disposition().trim().toUpperCase(Locale.ROOT),
                    request.summaryNotes().trim(),
                    nullableText(request.medicationNotes()),
                    request.followUpDate() == null ? null : Date.valueOf(request.followUpDate()),
                    uuidValue(SeedDataIds.CLINICIAN_USER_ID),
                    uuidValue(request.encounterId())
            );
        } else {
            jdbcTemplate.update(
                    "insert into discharge_plan (id, encounter_id, discharge_status, disposition, summary_notes, medication_notes, follow_up_date, discharged_by_user_id) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?)",
                    uuidValue(UUID.randomUUID()),
                    uuidValue(request.encounterId()),
                    request.dischargeStatus().trim().toUpperCase(Locale.ROOT),
                    request.disposition().trim().toUpperCase(Locale.ROOT),
                    request.summaryNotes().trim(),
                    nullableText(request.medicationNotes()),
                    request.followUpDate() == null ? null : Date.valueOf(request.followUpDate()),
                    uuidValue(SeedDataIds.CLINICIAN_USER_ID)
            );
        }

        if ("COMPLETED".equalsIgnoreCase(request.dischargeStatus())) {
            jdbcTemplate.update(
                    "update encounter set journey_stage = 'DISCHARGE', status = 'CLOSED', closed_at = current_timestamp where id = ?",
                    uuidValue(request.encounterId())
            );
        } else {
            jdbcTemplate.update(
                    "update encounter set journey_stage = 'DISCHARGE', status = 'IN_PROGRESS' where id = ?",
                    uuidValue(request.encounterId())
            );
        }

        return fetchDischarge(request.encounterId());
    }

    public List<InventoryItemSummary> inventoryItems() {
        return jdbcTemplate.query(
                inventorySelect() + " order by i.inventory_status desc, i.updated_at desc, i.item_name asc",
                (rs, rowNum) -> new InventoryItemSummary(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("sku"),
                        rs.getString("item_name"),
                        rs.getString("item_category"),
                        rs.getString("unit_of_measure"),
                        rs.getBigDecimal("quantity_on_hand"),
                        rs.getBigDecimal("reorder_level"),
                        rs.getString("inventory_status"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                )
        );
    }

    public InventoryItemSummary createInventoryItem(CreateInventoryItemRequest request) {
        UUID itemId = UUID.randomUUID();
        BigDecimal quantityOnHand = request.quantityOnHand();
        BigDecimal reorderLevel = request.reorderLevel();
        jdbcTemplate.update(
                "insert into inventory_item (id, organization_id, sku, item_name, item_category, unit_of_measure, quantity_on_hand, reorder_level, inventory_status, updated_at) " +
                        "values (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)",
                uuidValue(itemId),
                uuidValue(SeedDataIds.HOSPITAL_ID),
                request.sku().trim().toUpperCase(Locale.ROOT),
                request.itemName().trim(),
                request.itemCategory().trim().toUpperCase(Locale.ROOT),
                request.unitOfMeasure().trim().toUpperCase(Locale.ROOT),
                quantityOnHand,
                reorderLevel,
                inventoryStatus(quantityOnHand, reorderLevel)
        );

        if (hasPositiveQuantity(quantityOnHand)) {
            jdbcTemplate.update(
                    "insert into inventory_movement (id, inventory_item_id, movement_type, quantity, reference_entity_type, reference_entity_id, notes, moved_by_user_id) " +
                            "values (?, ?, ?, ?, ?, ?, ?, ?)",
                    uuidValue(UUID.randomUUID()),
                    uuidValue(itemId),
                    "RESTOCK",
                    quantityOnHand,
                    "INVENTORY_ITEM",
                    uuidValue(itemId),
                    "Opening stock",
                    uuidValue(SeedDataIds.PHARMACIST_USER_ID)
            );
        }

        return fetchInventoryItem(itemId);
    }

    public List<InventoryMovementSummary> inventoryMovements() {
        return jdbcTemplate.query(
                "select m.id, m.inventory_item_id, i.item_name, m.movement_type, m.quantity, m.reference_entity_type, m.reference_entity_id, " +
                        "m.notes, u.full_name as moved_by_name, m.moved_at " +
                        "from inventory_movement m " +
                        "join inventory_item i on i.id = m.inventory_item_id " +
                        "left join user_account u on u.id = m.moved_by_user_id " +
                        "order by m.moved_at desc " +
                        "limit 24",
                (rs, rowNum) -> new InventoryMovementSummary(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("inventory_item_id")),
                        rs.getString("item_name"),
                        rs.getString("movement_type"),
                        rs.getBigDecimal("quantity"),
                        rs.getString("reference_entity_type"),
                        rs.getString("reference_entity_id") == null ? null : UUID.fromString(rs.getString("reference_entity_id")),
                        rs.getString("notes"),
                        rs.getString("moved_by_name"),
                        rs.getTimestamp("moved_at").toLocalDateTime()
                )
        );
    }

    public InventoryMovementSummary recordInventoryMovement(RecordInventoryMovementRequest request) {
        InventoryItemSummary current = fetchInventoryItem(request.inventoryItemId());
        BigDecimal nextQuantity = current.quantityOnHand().add(movementDelta(request.movementType(), request.quantity()));
        if (nextQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Inventory movement would result in negative stock.");
        }

        jdbcTemplate.update(
                "update inventory_item set quantity_on_hand = ?, inventory_status = ?, updated_at = current_timestamp where id = ?",
                nextQuantity,
                inventoryStatus(nextQuantity, current.reorderLevel()),
                uuidValue(request.inventoryItemId())
        );

        UUID movementId = UUID.randomUUID();
        jdbcTemplate.update(
                "insert into inventory_movement (id, inventory_item_id, movement_type, quantity, reference_entity_type, reference_entity_id, notes, moved_by_user_id) " +
                        "values (?, ?, ?, ?, ?, ?, ?, ?)",
                uuidValue(movementId),
                uuidValue(request.inventoryItemId()),
                request.movementType().trim().toUpperCase(Locale.ROOT),
                request.quantity(),
                nullableText(request.referenceEntityType()),
                uuidValueOrNull(request.referenceEntityId()),
                nullableText(request.notes()),
                uuidValue(resolveMovementUser(request.movementType()))
        );

        return fetchInventoryMovement(movementId);
    }

    public List<TriageSummary> triageAssessments() {
        return jdbcTemplate.query(
                triageSelect() + " order by t.recorded_at desc",
                (rs, rowNum) -> new TriageSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("recorded_by_name"),
                        rs.getString("acuity_level"),
                        rs.getString("chief_complaint"),
                        rs.getBigDecimal("temperature_c"),
                        getInteger(rs.getObject("systolic_bp")),
                        getInteger(rs.getObject("diastolic_bp")),
                        getInteger(rs.getObject("heart_rate")),
                        getInteger(rs.getObject("respiratory_rate")),
                        getInteger(rs.getObject("oxygen_saturation")),
                        rs.getBigDecimal("weight_kg"),
                        rs.getString("notes"),
                        rs.getTimestamp("recorded_at").toLocalDateTime()
                )
        );
    }

    public List<ConsultationSummary> consultationNotes() {
        return jdbcTemplate.query(
                consultationSelect() + " order by c.recorded_at desc",
                (rs, rowNum) -> new ConsultationSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("clinician_name"),
                        rs.getString("diagnosis"),
                        rs.getString("clinical_notes"),
                        rs.getString("care_plan"),
                        rs.getString("follow_up_instruction"),
                        rs.getTimestamp("recorded_at").toLocalDateTime()
                )
        );
    }

    public List<EncounterDocumentationSummary> encounterDocumentation() {
        return jdbcTemplate.query(
                encounterDocumentationSelect() + " order by doc.updated_at desc",
                (rs, rowNum) -> new EncounterDocumentationSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("documented_by_name"),
                        rs.getString("patient_history"),
                        rs.getString("subjective_notes"),
                        rs.getString("objective_findings"),
                        rs.getString("assessment_notes"),
                        rs.getString("care_plan_notes"),
                        rs.getString("medication_plan"),
                        rs.getString("safety_flags"),
                        rs.getString("next_step_notes"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                )
        );
    }

    public List<DepartmentTaskSummary> departmentTasks() {
        return jdbcTemplate.query(
                taskSelect() + " order by t.updated_at desc",
                (rs, rowNum) -> new DepartmentTaskSummary(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("department_type"),
                        rs.getString("task_title"),
                        rs.getString("task_details"),
                        rs.getString("task_status"),
                        rs.getString("requested_by_name"),
                        rs.getString("assigned_to_name"),
                        rs.getString("assigned_to_id") == null ? null : UUID.fromString(rs.getString("assigned_to_id")),
                        rs.getString("inventory_item_id") == null ? null : UUID.fromString(rs.getString("inventory_item_id")),
                        rs.getString("item_name"),
                        rs.getBigDecimal("quantity_requested"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                )
        );
    }

    public List<DischargeSummary> dischargePlans() {
        return jdbcTemplate.query(
                dischargeSelect() + " order by d.updated_at desc",
                (rs, rowNum) -> new DischargeSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("discharge_status"),
                        rs.getString("disposition"),
                        rs.getString("summary_notes"),
                        rs.getString("medication_notes"),
                        rs.getDate("follow_up_date") == null ? null : rs.getDate("follow_up_date").toLocalDate(),
                        rs.getString("discharged_by_name"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                )
        );
    }

    private EncounterSummary fetchEncounter(UUID encounterId) {
        return jdbcTemplate.queryForObject(
                encounterSelect() + " where e.id = ?",
                (rs, rowNum) -> new EncounterSummary(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("clinician_name"),
                        rs.getString("journey_stage"),
                        rs.getString("status"),
                        rs.getTimestamp("opened_at").toLocalDateTime(),
                        rs.getTimestamp("closed_at") == null ? null : rs.getTimestamp("closed_at").toLocalDateTime()
                ),
                uuidValue(encounterId)
        );
    }

    private TriageSummary fetchTriage(UUID encounterId) {
        return jdbcTemplate.queryForObject(
                triageSelect() + " where t.encounter_id = ?",
                (rs, rowNum) -> new TriageSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("recorded_by_name"),
                        rs.getString("acuity_level"),
                        rs.getString("chief_complaint"),
                        rs.getBigDecimal("temperature_c"),
                        getInteger(rs.getObject("systolic_bp")),
                        getInteger(rs.getObject("diastolic_bp")),
                        getInteger(rs.getObject("heart_rate")),
                        getInteger(rs.getObject("respiratory_rate")),
                        getInteger(rs.getObject("oxygen_saturation")),
                        rs.getBigDecimal("weight_kg"),
                        rs.getString("notes"),
                        rs.getTimestamp("recorded_at").toLocalDateTime()
                ),
                uuidValue(encounterId)
        );
    }

    private ConsultationSummary fetchConsultation(UUID encounterId) {
        return jdbcTemplate.queryForObject(
                consultationSelect() + " where c.encounter_id = ?",
                (rs, rowNum) -> new ConsultationSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("clinician_name"),
                        rs.getString("diagnosis"),
                        rs.getString("clinical_notes"),
                        rs.getString("care_plan"),
                        rs.getString("follow_up_instruction"),
                        rs.getTimestamp("recorded_at").toLocalDateTime()
                ),
                uuidValue(encounterId)
        );
    }

    private EncounterDocumentationSummary fetchEncounterDocumentation(UUID encounterId) {
        return jdbcTemplate.queryForObject(
                encounterDocumentationSelect() + " where doc.encounter_id = ?",
                (rs, rowNum) -> new EncounterDocumentationSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("documented_by_name"),
                        rs.getString("patient_history"),
                        rs.getString("subjective_notes"),
                        rs.getString("objective_findings"),
                        rs.getString("assessment_notes"),
                        rs.getString("care_plan_notes"),
                        rs.getString("medication_plan"),
                        rs.getString("safety_flags"),
                        rs.getString("next_step_notes"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                ),
                uuidValue(encounterId)
        );
    }

    private DepartmentTaskSummary fetchTask(UUID taskId) {
        return jdbcTemplate.queryForObject(
                taskSelect() + " where t.id = ?",
                (rs, rowNum) -> new DepartmentTaskSummary(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("department_type"),
                        rs.getString("task_title"),
                        rs.getString("task_details"),
                        rs.getString("task_status"),
                        rs.getString("requested_by_name"),
                        rs.getString("assigned_to_name"),
                        rs.getString("assigned_to_id") == null ? null : UUID.fromString(rs.getString("assigned_to_id")),
                        rs.getString("inventory_item_id") == null ? null : UUID.fromString(rs.getString("inventory_item_id")),
                        rs.getString("item_name"),
                        rs.getBigDecimal("quantity_requested"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                ),
                uuidValue(taskId)
        );
    }

    private DischargeSummary fetchDischarge(UUID encounterId) {
        return jdbcTemplate.queryForObject(
                dischargeSelect() + " where d.encounter_id = ?",
                (rs, rowNum) -> new DischargeSummary(
                        UUID.fromString(rs.getString("encounter_id")),
                        UUID.fromString(rs.getString("patient_id")),
                        rs.getString("patient_name"),
                        rs.getString("discharge_status"),
                        rs.getString("disposition"),
                        rs.getString("summary_notes"),
                        rs.getString("medication_notes"),
                        rs.getDate("follow_up_date") == null ? null : rs.getDate("follow_up_date").toLocalDate(),
                        rs.getString("discharged_by_name"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                ),
                uuidValue(encounterId)
        );
    }

    private InventoryItemSummary fetchInventoryItem(UUID itemId) {
        return jdbcTemplate.queryForObject(
                inventorySelect() + " where i.id = ?",
                (rs, rowNum) -> new InventoryItemSummary(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("sku"),
                        rs.getString("item_name"),
                        rs.getString("item_category"),
                        rs.getString("unit_of_measure"),
                        rs.getBigDecimal("quantity_on_hand"),
                        rs.getBigDecimal("reorder_level"),
                        rs.getString("inventory_status"),
                        rs.getTimestamp("updated_at").toLocalDateTime()
                ),
                uuidValue(itemId)
        );
    }

    private InventoryMovementSummary fetchInventoryMovement(UUID movementId) {
        return jdbcTemplate.queryForObject(
                "select m.id, m.inventory_item_id, i.item_name, m.movement_type, m.quantity, m.reference_entity_type, m.reference_entity_id, " +
                        "m.notes, u.full_name as moved_by_name, m.moved_at " +
                        "from inventory_movement m " +
                        "join inventory_item i on i.id = m.inventory_item_id " +
                        "left join user_account u on u.id = m.moved_by_user_id " +
                        "where m.id = ?",
                (rs, rowNum) -> new InventoryMovementSummary(
                        UUID.fromString(rs.getString("id")),
                        UUID.fromString(rs.getString("inventory_item_id")),
                        rs.getString("item_name"),
                        rs.getString("movement_type"),
                        rs.getBigDecimal("quantity"),
                        rs.getString("reference_entity_type"),
                        rs.getString("reference_entity_id") == null ? null : UUID.fromString(rs.getString("reference_entity_id")),
                        rs.getString("notes"),
                        rs.getString("moved_by_name"),
                        rs.getTimestamp("moved_at").toLocalDateTime()
                ),
                uuidValue(movementId)
        );
    }

    private boolean exists(String tableName, UUID encounterId) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from " + tableName + " where encounter_id = ?",
                Integer.class,
                uuidValue(encounterId)
        );
        return count != null && count > 0;
    }

    private void issueInventory(UUID inventoryItemId, BigDecimal quantity, String referenceType, UUID referenceId, String notes) {
        InventoryItemSummary current = fetchInventoryItem(inventoryItemId);
        BigDecimal nextQuantity = current.quantityOnHand().subtract(quantity);
        if (nextQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Not enough stock available for the selected task.");
        }

        jdbcTemplate.update(
                "update inventory_item set quantity_on_hand = ?, inventory_status = ?, updated_at = current_timestamp where id = ?",
                nextQuantity,
                inventoryStatus(nextQuantity, current.reorderLevel()),
                uuidValue(inventoryItemId)
        );

        jdbcTemplate.update(
                "insert into inventory_movement (id, inventory_item_id, movement_type, quantity, reference_entity_type, reference_entity_id, notes, moved_by_user_id) " +
                        "values (?, ?, ?, ?, ?, ?, ?, ?)",
                uuidValue(UUID.randomUUID()),
                uuidValue(inventoryItemId),
                "ISSUE",
                quantity,
                referenceType,
                uuidValue(referenceId),
                "Issued to task: " + notes,
                uuidValue(SeedDataIds.PHARMACIST_USER_ID)
        );
    }

    private UUID defaultAssignee(String departmentType) {
        String normalized = departmentType.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "LAB" -> SeedDataIds.LAB_USER_ID;
            case "PHARMACY" -> SeedDataIds.PHARMACIST_USER_ID;
            default -> SeedDataIds.NURSE_USER_ID;
        };
    }

    private UUID resolveMovementUser(String movementType) {
        String normalized = movementType.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("RESTOCK") || normalized.contains("ADJUST")) {
            return SeedDataIds.PHARMACIST_USER_ID;
        }
        return SeedDataIds.LAB_USER_ID;
    }

    private String normalizeStage(String stage) {
        String normalized = stage.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "LAB", "DIAGNOSTIC" -> "LAB";
            case "PHARM", "PHARMACY", "MEDICATION" -> "PHARMACY";
            case "DISCHARGE" -> "DISCHARGE";
            case "TRIAGE" -> "TRIAGE";
            case "ADMISSION" -> "ADMISSION";
            default -> "CONSULTATION";
        };
    }

    private String defaultedStatus(String status) {
        if (status == null || status.isBlank()) {
            return "OPEN";
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }

    private String inventoryStatus(BigDecimal quantityOnHand, BigDecimal reorderLevel) {
        if (quantityOnHand.compareTo(BigDecimal.ZERO) <= 0) {
            return "OUT_OF_STOCK";
        }
        if (quantityOnHand.compareTo(reorderLevel) <= 0) {
            return "LOW_STOCK";
        }
        return "AVAILABLE";
    }

    private BigDecimal movementDelta(String movementType, BigDecimal quantity) {
        String normalized = movementType.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "RESTOCK", "ADJUSTMENT_IN" -> quantity;
            case "ISSUE", "ADJUSTMENT_OUT" -> quantity.negate();
            default -> throw new IllegalArgumentException("Unsupported movement type: " + movementType);
        };
    }

    private boolean isConsumptiveStatus(String status) {
        return "COMPLETED".equalsIgnoreCase(status) || "DISPENSED".equalsIgnoreCase(status);
    }

    private boolean hasPositiveQuantity(BigDecimal quantity) {
        return quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0;
    }

    private Integer getInteger(Object value) {
        return value == null ? null : ((Number) value).intValue();
    }

    private String nullableText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private SqlParameterValue uuidValue(UUID value) {
        return new SqlParameterValue(Types.OTHER, value);
    }

    private Object uuidValueOrNull(UUID value) {
        return value == null ? null : uuidValue(value);
    }

    private String encounterSelect() {
        return "select e.id, e.patient_id, patient_user.full_name as patient_name, clinician.full_name as clinician_name, " +
                "e.journey_stage, e.status, e.opened_at, e.closed_at " +
                "from encounter e " +
                "join patient_profile p on p.id = e.patient_id " +
                "join user_account patient_user on patient_user.id = p.user_account_id " +
                "left join user_account clinician on clinician.id = e.attending_user_id";
    }

    private String triageSelect() {
        return "select t.encounter_id, e.patient_id, patient_user.full_name as patient_name, recorder.full_name as recorded_by_name, " +
                "t.acuity_level, t.chief_complaint, t.temperature_c, t.systolic_bp, t.diastolic_bp, t.heart_rate, " +
                "t.respiratory_rate, t.oxygen_saturation, t.weight_kg, t.notes, t.recorded_at " +
                "from triage_assessment t " +
                "join encounter e on e.id = t.encounter_id " +
                "join patient_profile p on p.id = e.patient_id " +
                "join user_account patient_user on patient_user.id = p.user_account_id " +
                "left join user_account recorder on recorder.id = t.recorded_by_user_id";
    }

    private String consultationSelect() {
        return "select c.encounter_id, e.patient_id, patient_user.full_name as patient_name, clinician.full_name as clinician_name, " +
                "c.diagnosis, c.clinical_notes, c.care_plan, c.follow_up_instruction, c.recorded_at " +
                "from consultation_note c " +
                "join encounter e on e.id = c.encounter_id " +
                "join patient_profile p on p.id = e.patient_id " +
                "join user_account patient_user on patient_user.id = p.user_account_id " +
                "left join user_account clinician on clinician.id = c.clinician_user_id";
    }

    private String encounterDocumentationSelect() {
        return "select doc.encounter_id, e.patient_id, patient_user.full_name as patient_name, author.full_name as documented_by_name, " +
                "doc.patient_history, doc.subjective_notes, doc.objective_findings, doc.assessment_notes, doc.care_plan_notes, " +
                "doc.medication_plan, doc.safety_flags, doc.next_step_notes, doc.updated_at " +
                "from encounter_documentation doc " +
                "join encounter e on e.id = doc.encounter_id " +
                "join patient_profile p on p.id = e.patient_id " +
                "join user_account patient_user on patient_user.id = p.user_account_id " +
                "left join user_account author on author.id = doc.documented_by_user_id";
    }

    private String taskSelect() {
        return "select t.id, t.encounter_id, t.patient_id, patient_user.full_name as patient_name, t.department_type, " +
                "t.task_title, t.task_details, t.task_status, requester.full_name as requested_by_name, assignee.full_name as assigned_to_name, " +
                "t.assigned_to_user_id as assigned_to_id, t.inventory_item_id, item.item_name, t.quantity_requested, t.updated_at " +
                "from department_task t " +
                "join patient_profile p on p.id = t.patient_id " +
                "join user_account patient_user on patient_user.id = p.user_account_id " +
                "left join user_account requester on requester.id = t.requested_by_user_id " +
                "left join user_account assignee on assignee.id = t.assigned_to_user_id " +
                "left join inventory_item item on item.id = t.inventory_item_id";
    }

    private String dischargeSelect() {
        return "select d.encounter_id, e.patient_id, patient_user.full_name as patient_name, d.discharge_status, d.disposition, " +
                "d.summary_notes, d.medication_notes, d.follow_up_date, staff.full_name as discharged_by_name, d.updated_at " +
                "from discharge_plan d " +
                "join encounter e on e.id = d.encounter_id " +
                "join patient_profile p on p.id = e.patient_id " +
                "join user_account patient_user on patient_user.id = p.user_account_id " +
                "left join user_account staff on staff.id = d.discharged_by_user_id";
    }

    private String inventorySelect() {
        return "select i.id, i.sku, i.item_name, i.item_category, i.unit_of_measure, i.quantity_on_hand, i.reorder_level, " +
                "i.inventory_status, i.updated_at from inventory_item i";
    }

    public record CareBoard(
            List<EncounterSummary> encounters,
            List<TriageSummary> triage,
            List<ConsultationSummary> consultations,
            List<EncounterDocumentationSummary> documentation,
            List<DepartmentTaskSummary> tasks,
            List<DischargeSummary> discharges,
            List<InventoryItemSummary> inventoryItems,
            List<InventoryMovementSummary> inventoryMovements
    ) {
    }

    public record EncounterSummary(
            UUID id,
            UUID patientId,
            String patientName,
            String clinicianName,
            String journeyStage,
            String status,
            LocalDateTime openedAt,
            LocalDateTime closedAt
    ) {
    }

    public record TriageSummary(
            UUID encounterId,
            UUID patientId,
            String patientName,
            String recordedByName,
            String acuityLevel,
            String chiefComplaint,
            BigDecimal temperatureC,
            Integer systolicBp,
            Integer diastolicBp,
            Integer heartRate,
            Integer respiratoryRate,
            Integer oxygenSaturation,
            BigDecimal weightKg,
            String notes,
            LocalDateTime recordedAt
    ) {
    }

    public record ConsultationSummary(
            UUID encounterId,
            UUID patientId,
            String patientName,
            String clinicianName,
            String diagnosis,
            String clinicalNotes,
            String carePlan,
            String followUpInstruction,
            LocalDateTime recordedAt
    ) {
    }

    public record EncounterDocumentationSummary(
            UUID encounterId,
            UUID patientId,
            String patientName,
            String documentedByName,
            String patientHistory,
            String subjectiveNotes,
            String objectiveFindings,
            String assessmentNotes,
            String carePlanNotes,
            String medicationPlan,
            String safetyFlags,
            String nextStepNotes,
            LocalDateTime updatedAt
    ) {
    }

    public record DepartmentTaskSummary(
            UUID id,
            UUID encounterId,
            UUID patientId,
            String patientName,
            String departmentType,
            String taskTitle,
            String taskDetails,
            String taskStatus,
            String requestedByName,
            String assignedToName,
            UUID assignedToUserId,
            UUID inventoryItemId,
            String inventoryItemName,
            BigDecimal quantityRequested,
            LocalDateTime updatedAt
    ) {
    }

    public record DischargeSummary(
            UUID encounterId,
            UUID patientId,
            String patientName,
            String dischargeStatus,
            String disposition,
            String summaryNotes,
            String medicationNotes,
            LocalDate followUpDate,
            String dischargedByName,
            LocalDateTime updatedAt
    ) {
    }

    public record InventoryItemSummary(
            UUID id,
            String sku,
            String itemName,
            String itemCategory,
            String unitOfMeasure,
            BigDecimal quantityOnHand,
            BigDecimal reorderLevel,
            String inventoryStatus,
            LocalDateTime updatedAt
    ) {
    }

    public record InventoryMovementSummary(
            UUID id,
            UUID inventoryItemId,
            String itemName,
            String movementType,
            BigDecimal quantity,
            String referenceEntityType,
            UUID referenceEntityId,
            String notes,
            String movedByName,
            LocalDateTime movedAt
    ) {
    }

    public record CreateEncounterRequest(
            @NotNull UUID patientId,
            @NotBlank String journeyStage,
            String status
    ) {
    }

    public record UpdateEncounterRequest(
            String journeyStage,
            String status
    ) {
    }

    public record UpsertTriageRequest(
            @NotNull UUID encounterId,
            @NotBlank String acuityLevel,
            @NotBlank String chiefComplaint,
            BigDecimal temperatureC,
            Integer systolicBp,
            Integer diastolicBp,
            Integer heartRate,
            Integer respiratoryRate,
            Integer oxygenSaturation,
            BigDecimal weightKg,
            String notes
    ) {
    }

    public record UpsertConsultationRequest(
            @NotNull UUID encounterId,
            @NotBlank String diagnosis,
            @NotBlank String clinicalNotes,
            String carePlan,
            String followUpInstruction
    ) {
    }

    public record UpsertEncounterDocumentationRequest(
            @NotNull UUID encounterId,
            String patientHistory,
            @NotBlank String subjectiveNotes,
            @NotBlank String objectiveFindings,
            @NotBlank String assessmentNotes,
            @NotBlank String carePlanNotes,
            String medicationPlan,
            String safetyFlags,
            String nextStepNotes
    ) {
    }

    public record CreateTaskRequest(
            @NotNull UUID encounterId,
            @NotBlank String departmentType,
            @NotBlank String taskTitle,
            String taskDetails,
            UUID inventoryItemId,
            @DecimalMin("0.00") BigDecimal quantityRequested
    ) {
    }

    public record UpdateTaskRequest(
            String taskStatus,
            String taskDetails,
            UUID assignedToUserId,
            UUID inventoryItemId,
            @DecimalMin("0.00") BigDecimal quantityRequested
    ) {
    }

    public record UpsertDischargeRequest(
            @NotNull UUID encounterId,
            @NotBlank String dischargeStatus,
            @NotBlank String disposition,
            @NotBlank String summaryNotes,
            String medicationNotes,
            LocalDate followUpDate
    ) {
    }

    public record CreateInventoryItemRequest(
            @NotBlank String sku,
            @NotBlank String itemName,
            @NotBlank String itemCategory,
            @NotBlank String unitOfMeasure,
            @NotNull @DecimalMin("0.00") BigDecimal quantityOnHand,
            @NotNull @DecimalMin("0.00") BigDecimal reorderLevel
    ) {
    }

    public record RecordInventoryMovementRequest(
            @NotNull UUID inventoryItemId,
            @NotBlank String movementType,
            @NotNull @DecimalMin("0.01") BigDecimal quantity,
            String referenceEntityType,
            UUID referenceEntityId,
            String notes
    ) {
    }
}
