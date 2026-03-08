package com.structurehealth.billing.application;

import com.structurehealth.shared.domain.support.SeedDataIds;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BillingClaimsService {

    private final JdbcTemplate jdbcTemplate;

    public BillingClaimsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ClaimSummary> claims() {
        return jdbcTemplate.query(
                "select c.id, c.encounter_id, e.patient_id, patient_user.full_name as patient_name, c.claim_status, " +
                        "c.total_amount, c.approved_amount, c.submitted_at " +
                        "from claim_case c " +
                        "join encounter e on e.id = c.encounter_id " +
                        "join patient_profile p on p.id = e.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "order by c.submitted_at desc nulls last",
                (rs, rowNum) -> new ClaimSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("encounter_id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("claim_status"),
                rs.getBigDecimal("total_amount"),
                rs.getBigDecimal("approved_amount"),
                rs.getTimestamp("submitted_at") == null ? null : rs.getTimestamp("submitted_at").toLocalDateTime()
        ));
    }

    public ClaimSummary createClaim(CreateClaimRequest request) {
        UUID claimId = UUID.randomUUID();
        jdbcTemplate.update(
                "insert into claim_case (id, encounter_id, hospital_id, hmo_id, claim_status, total_amount, approved_amount, submitted_at, settled_at) " +
                        "values (?, ?, ?, ?, 'SUBMITTED', ?, null, ?, null)",
                uuidValue(claimId), uuidValue(request.encounterId()), uuidValue(SeedDataIds.HOSPITAL_ID), uuidValue(SeedDataIds.HMO_ID), request.totalAmount(), Timestamp.valueOf(LocalDateTime.now()));

        return jdbcTemplate.queryForObject(
                "select c.id, c.encounter_id, e.patient_id, patient_user.full_name as patient_name, c.claim_status, " +
                        "c.total_amount, c.approved_amount, c.submitted_at " +
                        "from claim_case c " +
                        "join encounter e on e.id = c.encounter_id " +
                        "join patient_profile p on p.id = e.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "where c.id = ?",
                (rs, rowNum) -> new ClaimSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("encounter_id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("claim_status"),
                rs.getBigDecimal("total_amount"),
                rs.getBigDecimal("approved_amount"),
                rs.getTimestamp("submitted_at") == null ? null : rs.getTimestamp("submitted_at").toLocalDateTime()
        ), uuidValue(claimId));
    }

    public ClaimSummary updateClaim(UUID claimId, UpdateClaimDecisionRequest request) {
        ClaimSummary current = jdbcTemplate.queryForObject(
                "select c.id, c.encounter_id, e.patient_id, patient_user.full_name as patient_name, c.claim_status, " +
                        "c.total_amount, c.approved_amount, c.submitted_at " +
                        "from claim_case c " +
                        "join encounter e on e.id = c.encounter_id " +
                        "join patient_profile p on p.id = e.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "where c.id = ?",
                (rs, rowNum) -> new ClaimSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("encounter_id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("claim_status"),
                rs.getBigDecimal("total_amount"),
                rs.getBigDecimal("approved_amount"),
                rs.getTimestamp("submitted_at") == null ? null : rs.getTimestamp("submitted_at").toLocalDateTime()
        ), uuidValue(claimId));

        String nextStatus = request.status() == null || request.status().isBlank() ? current.status() : request.status();
        BigDecimal nextApprovedAmount = request.approvedAmount() == null ? current.approvedAmount() : request.approvedAmount();
        Timestamp settledAt = "APPROVED".equalsIgnoreCase(nextStatus) ? Timestamp.valueOf(LocalDateTime.now()) : null;

        jdbcTemplate.update(
                "update claim_case set claim_status = ?, approved_amount = ?, settled_at = ? where id = ?",
                nextStatus, nextApprovedAmount, settledAt, uuidValue(claimId));

        BigDecimal varianceAmount = switch (nextStatus.toUpperCase()) {
            case "APPROVED" -> BigDecimal.ZERO;
            case "DENIED" -> current.totalAmount();
            default -> current.totalAmount().subtract(nextApprovedAmount == null ? BigDecimal.ZERO : nextApprovedAmount);
        };
        String hmoPosition = switch (nextStatus.toUpperCase()) {
            case "APPROVED" -> "APPROVED";
            case "DENIED" -> "DENIED";
            default -> "UNDER_REVIEW";
        };
        String reconciliationStatus = "APPROVED".equalsIgnoreCase(nextStatus) ? "ALIGNED" : "OPEN";

        jdbcTemplate.update(
                "update reconciliation_case set hmo_position = ?, variance_amount = ?, reconciliation_status = ?, updated_at = current_timestamp where claim_case_id = ?",
                hmoPosition, varianceAmount, reconciliationStatus, uuidValue(claimId));

        return jdbcTemplate.queryForObject(
                "select c.id, c.encounter_id, e.patient_id, patient_user.full_name as patient_name, c.claim_status, " +
                        "c.total_amount, c.approved_amount, c.submitted_at " +
                        "from claim_case c " +
                        "join encounter e on e.id = c.encounter_id " +
                        "join patient_profile p on p.id = e.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "where c.id = ?",
                (rs, rowNum) -> new ClaimSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("encounter_id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("claim_status"),
                rs.getBigDecimal("total_amount"),
                rs.getBigDecimal("approved_amount"),
                rs.getTimestamp("submitted_at") == null ? null : rs.getTimestamp("submitted_at").toLocalDateTime()
        ), uuidValue(claimId));
    }

    public List<ReconciliationSummary> reconciliations() {
        return jdbcTemplate.query(
                "select r.id, r.claim_case_id, e.patient_id, patient_user.full_name as patient_name, c.claim_status, " +
                        "r.patient_position, r.hospital_position, r.hmo_position, r.variance_amount, " +
                        "r.reconciliation_status, r.updated_at " +
                        "from reconciliation_case r " +
                        "join claim_case c on c.id = r.claim_case_id " +
                        "join encounter e on e.id = c.encounter_id " +
                        "join patient_profile p on p.id = e.patient_id " +
                        "join user_account patient_user on patient_user.id = p.user_account_id " +
                        "order by r.updated_at desc",
                (rs, rowNum) -> new ReconciliationSummary(
                UUID.fromString(rs.getString("id")),
                UUID.fromString(rs.getString("claim_case_id")),
                UUID.fromString(rs.getString("patient_id")),
                rs.getString("patient_name"),
                rs.getString("claim_status"),
                rs.getString("patient_position"),
                rs.getString("hospital_position"),
                rs.getString("hmo_position"),
                rs.getBigDecimal("variance_amount"),
                rs.getString("reconciliation_status"),
                rs.getTimestamp("updated_at").toLocalDateTime()
        ));
    }

    public record ClaimSummary(
            UUID id,
            UUID encounterId,
            UUID patientId,
            String patientName,
            String status,
            BigDecimal totalAmount,
            BigDecimal approvedAmount,
            LocalDateTime submittedAt
    ) {
    }

    public record CreateClaimRequest(
            @NotNull UUID encounterId,
            @NotNull @DecimalMin("0.01") BigDecimal totalAmount
    ) {
    }

    public record UpdateClaimDecisionRequest(
            String status,
            BigDecimal approvedAmount
    ) {
    }

    public record ReconciliationSummary(
            UUID id,
            UUID claimId,
            UUID patientId,
            String patientName,
            String claimStatus,
            String patientPosition,
            String hospitalPosition,
            String hmoPosition,
            BigDecimal varianceAmount,
            String reconciliationStatus,
            LocalDateTime updatedAt
    ) {
    }

    private SqlParameterValue uuidValue(UUID value) {
        return new SqlParameterValue(Types.OTHER, value);
    }
}
