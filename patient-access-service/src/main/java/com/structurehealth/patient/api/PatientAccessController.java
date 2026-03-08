package com.structurehealth.patient.api;

import com.structurehealth.patient.application.PatientAccessService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class PatientAccessController {

    private final PatientAccessService patientAccessService;

    public PatientAccessController(PatientAccessService patientAccessService) {
        this.patientAccessService = patientAccessService;
    }

    @GetMapping("/api/v1/patients")
    public List<PatientAccessService.PatientSummary> patients() {
        return patientAccessService.patients();
    }

    @PostMapping("/api/v1/patients")
    public PatientAccessService.PatientSummary createPatient(
            @Valid @RequestBody PatientAccessService.CreatePatientRequest request
    ) {
        return patientAccessService.createPatient(request);
    }

    @GetMapping("/api/v1/appointments")
    public List<PatientAccessService.AppointmentSummary> appointments() {
        return patientAccessService.appointments();
    }

    @PostMapping("/api/v1/appointments")
    public PatientAccessService.AppointmentSummary createAppointment(
            @Valid @RequestBody PatientAccessService.CreateAppointmentRequest request
    ) {
        return patientAccessService.createAppointment(request);
    }

    @PatchMapping("/api/v1/appointments/{appointmentId}")
    public PatientAccessService.AppointmentSummary updateAppointment(
            @PathVariable("appointmentId") UUID appointmentId,
            @Valid @RequestBody PatientAccessService.UpdateAppointmentRequest request
    ) {
        return patientAccessService.updateAppointment(appointmentId, request);
    }

    @GetMapping("/api/v1/threads")
    public List<PatientAccessService.ThreadSummary> threads(@RequestParam("patientId") UUID patientId) {
        return patientAccessService.threads(patientId);
    }

    @PostMapping("/api/v1/threads")
    public PatientAccessService.ThreadSummary createThread(
            @Valid @RequestBody PatientAccessService.CreateThreadRequest request
    ) {
        return patientAccessService.createThread(request);
    }

    @GetMapping("/api/v1/threads/{threadId}/messages")
    public List<PatientAccessService.MessageSummary> messages(@PathVariable("threadId") UUID threadId) {
        return patientAccessService.messages(threadId);
    }

    @PostMapping("/api/v1/threads/{threadId}/messages")
    public PatientAccessService.MessageSummary addMessage(
            @PathVariable("threadId") UUID threadId,
            @Valid @RequestBody PatientAccessService.AddMessageRequest request
    ) {
        return patientAccessService.addMessage(threadId, request);
    }
}
