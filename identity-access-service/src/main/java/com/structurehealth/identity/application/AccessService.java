package com.structurehealth.identity.application;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AccessService {

    private final JdbcTemplate jdbcTemplate;

    public AccessService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public AuthenticatedUserResponse me(Authentication authentication) {
        return new AuthenticatedUserResponse(
                authentication.getName(),
                authentication.getAuthorities().stream().map(authority -> authority.getAuthority()).toList()
        );
    }

    public List<OrganizationSummary> organizations() {
        return jdbcTemplate.query("""
                select o.id, o.code, o.name, o.organization_type, count(d.id) as department_count
                from organization o
                left join department d on d.organization_id = o.id
                group by o.id, o.code, o.name, o.organization_type
                order by o.name
                """, (rs, rowNum) -> new OrganizationSummary(
                UUID.fromString(rs.getString("id")),
                rs.getString("code"),
                rs.getString("name"),
                rs.getString("organization_type"),
                rs.getInt("department_count")
        ));
    }

    public List<WorkspaceSummary> workspaces() {
        return List.of(
                new WorkspaceSummary("PATIENT", "Patient Portal", List.of("View encounters", "Book appointments", "Send messages")),
                new WorkspaceSummary("CLINICIAN", "Clinical Workspace", List.of("Review encounters", "Open consultations", "Update patient journey")),
                new WorkspaceSummary("HOSPITAL_ADMIN", "Hospital Operations", List.of("Manage departments", "See queues", "Monitor service execution")),
                new WorkspaceSummary("HMO_CLAIMS_OFFICER", "Claims Workspace", List.of("Review claims", "Approve or pend", "Track utilization")),
                new WorkspaceSummary("MINISTRY_ANALYST", "Ministry Dashboard", List.of("View oversight metrics", "Monitor compliance", "See utilization trends"))
        );
    }

    public record AuthenticatedUserResponse(
            String username,
            List<String> roles
    ) {
    }

    public record OrganizationSummary(
            UUID id,
            String code,
            String name,
            String organizationType,
            int departmentCount
    ) {
    }

    public record WorkspaceSummary(
            String role,
            String workspace,
            List<String> capabilities
    ) {
    }
}
