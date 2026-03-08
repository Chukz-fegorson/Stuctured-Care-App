package com.structurehealth.backend.platform.application;

public class DemoResetSummary {

    private final String triggeredBy;
    private final int organizations;
    private final int patients;
    private final int appointments;
    private final int encounters;
    private final int tasks;
    private final int claims;
    private final int inventoryItems;

    public DemoResetSummary(
            String triggeredBy,
            int organizations,
            int patients,
            int appointments,
            int encounters,
            int tasks,
            int claims,
            int inventoryItems
    ) {
        this.triggeredBy = triggeredBy;
        this.organizations = organizations;
        this.patients = patients;
        this.appointments = appointments;
        this.encounters = encounters;
        this.tasks = tasks;
        this.claims = claims;
        this.inventoryItems = inventoryItems;
    }

    public String getTriggeredBy() {
        return triggeredBy;
    }

    public int getOrganizations() {
        return organizations;
    }

    public int getPatients() {
        return patients;
    }

    public int getAppointments() {
        return appointments;
    }

    public int getEncounters() {
        return encounters;
    }

    public int getTasks() {
        return tasks;
    }

    public int getClaims() {
        return claims;
    }

    public int getInventoryItems() {
        return inventoryItems;
    }
}
