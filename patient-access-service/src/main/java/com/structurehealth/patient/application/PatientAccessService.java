package com.structurehealth.patient.application;

import com.structurehealth.shared.domain.support.SeedDataIds;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PatientAccessService {

    private final JdbcTemplate jdbcTemplate;

    public PatientAccessService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PatientSummary> patients() {
        return jdbcTemplate.query(
                "select p.id, u.full_name, u.email, p.global_patient_number, p.gender, p.date_of_birth, " +
                        "p.phone_number, p.insurance_member_number, p.created_at " +
                        "from patient_profile p " +
                        "join user_account u on u.id = p.user_account_id " +
                        "order by p.created_at desc",
                (rs, rowNum) -> new PatientSummary(
                UUID.fromString(rs.getString("id")),
                rs.getString("full_name"),
                rs.getString("email"),
                rs.getString("global_patient_number"),
                rs.getString("gender"),
                rs.getObject("date_of_birth", LocalDate.class),
                rs.getString("phone_number"),
                rs.getString("insurance_member_number"),
                rs.getTimestamp("created_at").toLocalDateTime()
        ));
    }

    public PatientSummary createPatient(CreatePatientRequest request) {
        UUID userId = UUID.randomUUID();
        UUID patientId = UUID.randomUUID();
        String globalPatientNumber = "SHP-" + patientId.toString().substring(0, 8).toUpperCase();

        jdbcTemplate.update(
                "insert into user_account (id, organization_id, department_id, platform_role, email, full_name, status) " +
                        "values (?, ?, null, 'PATIENT', ?, ?, 'ACTIVE')",
                uuidValue(userId), uuidValue(SeedDataIds.HOSPITAL_ID), request.email(), request.fullName());

        jdbcTemplate.update(
                "insert into patient_profile (id, user_account_id, global_patient_number, insurance_member_number, gender, date_of_birth, phone_number) " +
                        "values (?, ?, ?, ?, ?, ?, ?)",
                uuidValue(patientId), uuidValue(userId), globalPatientNumber, request.insuranceMemberNumber(), request.gender(), request.dateOfBirth(), request.phoneNumber());

        return new PatientSummary(
                patientId,
                request.fullName(),
                request.email(),
                globalPatientNumber,
                request.gender(),
                request.dateOfBirth(),
                request.phoneNumber(),
                request.insuranceMemberNumber(),
                LocalDateTime.now()
        );
    }

    public List<AppointmentSummary> appointments() {
        return jdbcTemplate.query(
                "select a.id, a.patient_id, patient_user.full_name as patient_name, a.reason, a.appointment_status, " +
                        "a.scheduled_at, clinician.full_name as clinician_name " +
                        "from appointment a " +
                        "join patient_profile p on p.id = a.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "left join user_account clinician on clinician.id = a.clinician_user_id " +
                        "order by a.scheduled_at",
                (rs, rowNum) -> new AppointmentSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("reason"),
                rs.getString("appointment_status"),
                rs.getTimestamp("scheduled_at").toLocalDateTime(),
                rs.getString("clinician_name")
        ));
    }

    public AppointmentSummary createAppointment(CreateAppointmentRequest request) {
        UUID appointmentId = UUID.randomUUID();
        UUID clinicianUserId = request.clinicianUserId() == null ? SeedDataIds.CLINICIAN_USER_ID : request.clinicianUserId();

        jdbcTemplate.update(
                "insert into appointment (id, patient_id, hospital_id, clinician_user_id, appointment_status, reason, scheduled_at) " +
                        "values (?, ?, ?, ?, 'SCHEDULED', ?, ?)",
                uuidValue(appointmentId), uuidValue(request.patientId()), uuidValue(SeedDataIds.HOSPITAL_ID), uuidValue(clinicianUserId), request.reason(), Timestamp.valueOf(request.scheduledAt()));

        return jdbcTemplate.queryForObject(
                "select a.id, a.patient_id, patient_user.full_name as patient_name, a.reason, a.appointment_status, " +
                        "a.scheduled_at, clinician.full_name as clinician_name " +
                        "from appointment a " +
                        "join patient_profile p on p.id = a.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "left join user_account clinician on clinician.id = a.clinician_user_id " +
                        "where a.id = ?",
                (rs, rowNum) -> new AppointmentSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("reason"),
                rs.getString("appointment_status"),
                rs.getTimestamp("scheduled_at").toLocalDateTime(),
                rs.getString("clinician_name")
        ), uuidValue(appointmentId));
    }

    public AppointmentSummary updateAppointment(UUID appointmentId, UpdateAppointmentRequest request) {
        AppointmentSummary current = jdbcTemplate.queryForObject(
                "select a.id, a.patient_id, patient_user.full_name as patient_name, a.reason, a.appointment_status, " +
                        "a.scheduled_at, clinician.full_name as clinician_name " +
                        "from appointment a " +
                        "join patient_profile p on p.id = a.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "left join user_account clinician on clinician.id = a.clinician_user_id " +
                        "where a.id = ?",
                (rs, rowNum) -> new AppointmentSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("reason"),
                rs.getString("appointment_status"),
                rs.getTimestamp("scheduled_at").toLocalDateTime(),
                rs.getString("clinician_name")
        ), uuidValue(appointmentId));

        String nextStatus = request.status() == null || request.status().isBlank() ? current.status() : request.status();
        LocalDateTime nextScheduledAt = request.scheduledAt() == null ? current.scheduledAt() : request.scheduledAt();

        jdbcTemplate.update(
                "update appointment set appointment_status = ?, scheduled_at = ? where id = ?",
                nextStatus, Timestamp.valueOf(nextScheduledAt), uuidValue(appointmentId));

        return jdbcTemplate.queryForObject(
                "select a.id, a.patient_id, patient_user.full_name as patient_name, a.reason, a.appointment_status, " +
                        "a.scheduled_at, clinician.full_name as clinician_name " +
                        "from appointment a " +
                        "join patient_profile p on p.id = a.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "left join user_account clinician on clinician.id = a.clinician_user_id " +
                        "where a.id = ?",
                (rs, rowNum) -> new AppointmentSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("reason"),
                rs.getString("appointment_status"),
                rs.getTimestamp("scheduled_at").toLocalDateTime(),
                rs.getString("clinician_name")
        ), uuidValue(appointmentId));
    }

    public List<ThreadSummary> threads(UUID patientId) {
        return jdbcTemplate.query(
                "select t.id, t.patient_id, t.subject, t.thread_status, t.created_at, count(m.id) as message_count " +
                        "from patient_message_thread t " +
                        "left join patient_message m on m.thread_id = t.id " +
                        "where t.patient_id = ? " +
                        "group by t.id, t.patient_id, t.subject, t.thread_status, t.created_at " +
                        "order by t.created_at desc",
                (rs, rowNum) -> new ThreadSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("subject"),
                rs.getString("thread_status"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getInt("message_count")
        ), uuidValue(patientId));
    }

    public ThreadSummary createThread(CreateThreadRequest request) {
        UUID threadId = UUID.randomUUID();
        jdbcTemplate.update(
                "insert into patient_message_thread (id, patient_id, hospital_id, encounter_id, subject, thread_status) " +
                        "values (?, ?, ?, null, ?, 'OPEN')",
                uuidValue(threadId), uuidValue(request.patientId()), uuidValue(SeedDataIds.HOSPITAL_ID), request.subject());
        return new ThreadSummary(threadId, request.patientId(), request.subject(), "OPEN", LocalDateTime.now(), 0);
    }

    public List<MessageSummary> messages(UUID threadId) {
        return jdbcTemplate.query(
                "select m.id, m.thread_id, m.sender_user_id, m.sender_patient_id, m.message_type, m.body, m.sent_at " +
                        "from patient_message m " +
                        "where m.thread_id = ? " +
                        "order by m.sent_at",
                (rs, rowNum) -> new MessageSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("thread_id")),
                rs.getString("sender_user_id"),
                rs.getString("sender_patient_id"),
                rs.getString("message_type"),
                rs.getString("body"),
                rs.getTimestamp("sent_at").toLocalDateTime()
        ), uuidValue(threadId));
    }

    public MessageSummary addMessage(UUID threadId, AddMessageRequest request) {
        UUID messageId = UUID.randomUUID();
        UUID senderUserId = "STAFF".equalsIgnoreCase(request.senderType()) ? request.senderId() : null;
        UUID senderPatientId = "PATIENT".equalsIgnoreCase(request.senderType()) ? request.senderId() : null;

        jdbcTemplate.update(
                "insert into patient_message (id, thread_id, sender_user_id, sender_patient_id, message_type, body) " +
                        "values (?, ?, ?, ?, 'TEXT', ?)",
                uuidValue(messageId), uuidValue(threadId), uuidValue(senderUserId), uuidValue(senderPatientId), request.body());

        return new MessageSummary(
                messageId,
                threadId,
                senderUserId == null ? null : senderUserId.toString(),
                senderPatientId == null ? null : senderPatientId.toString(),
                "TEXT",
                request.body(),
                LocalDateTime.now()
        );
    }

    public record PatientSummary(
            UUID id,
            String fullName,
            String email,
            String globalPatientNumber,
            String gender,
            LocalDate dateOfBirth,
            String phoneNumber,
            String insuranceMemberNumber,
            LocalDateTime createdAt
    ) {
    }

    public record CreatePatientRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            String phoneNumber,
            String gender,
            LocalDate dateOfBirth,
            String insuranceMemberNumber
    ) {
    }

    public record AppointmentSummary(
            UUID id,
            UUID patientId,
            String patientName,
            String reason,
            String status,
            LocalDateTime scheduledAt,
            String clinicianName
    ) {
    }

    public record CreateAppointmentRequest(
            @NotNull UUID patientId,
            @NotBlank String reason,
            @NotNull LocalDateTime scheduledAt,
            UUID clinicianUserId
    ) {
    }

    public record UpdateAppointmentRequest(
            String status,
            LocalDateTime scheduledAt
    ) {
    }

    public record ThreadSummary(
            UUID id,
            UUID patientId,
            String subject,
            String status,
            LocalDateTime createdAt,
            int messageCount
    ) {
    }

    public record CreateThreadRequest(
            @NotNull UUID patientId,
            @NotBlank String subject
    ) {
    }

    public record MessageSummary(
            UUID id,
            UUID threadId,
            String senderUserId,
            String senderPatientId,
            String messageType,
            String body,
            LocalDateTime sentAt
    ) {
    }

    public record AddMessageRequest(
            @NotBlank String senderType,
            @NotNull UUID senderId,
            @NotBlank String body
    ) {
    }

    private SqlParameterValue uuidValue(UUID value) {
        return new SqlParameterValue(Types.OTHER, value);
    }
}
