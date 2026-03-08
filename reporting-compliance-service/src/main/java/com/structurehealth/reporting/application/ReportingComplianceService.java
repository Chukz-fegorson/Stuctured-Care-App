package com.structurehealth.reporting.application;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ReportingComplianceService {

    private final JdbcTemplate jdbcTemplate;

    public ReportingComplianceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public OverviewResponse overview() {
        return new OverviewResponse(
                count("organization"),
                count("patient_profile"),
                count("appointment"),
                countWhere("encounter", "status = 'OPEN'"),
                countWhere("patient_message_thread", "thread_status = 'OPEN'"),
                count("claim_case"),
                amount("claim_case", "total_amount"),
                countWhere("department_task", "task_status in ('REQUESTED', 'IN_PROGRESS')"),
                countWhere("inventory_item", "inventory_status in ('LOW_STOCK', 'OUT_OF_STOCK')")
        );
    }

    private int count(String tableName) {
        Integer value = jdbcTemplate.queryForObject("select count(*) from " + tableName, Integer.class);
        return value == null ? 0 : value;
    }

    private int countWhere(String tableName, String condition) {
        Integer value = jdbcTemplate.queryForObject("select count(*) from " + tableName + " where " + condition, Integer.class);
        return value == null ? 0 : value;
    }

    private BigDecimal amount(String tableName, String columnName) {
        BigDecimal value = jdbcTemplate.queryForObject("select coalesce(sum(" + columnName + "), 0) from " + tableName, BigDecimal.class);
        return value == null ? BigDecimal.ZERO : value;
    }

    public record OverviewResponse(
            int organizations,
            int patients,
            int appointments,
            int openEncounters,
            int openThreads,
            int claims,
            BigDecimal claimValue,
            int pendingTasks,
            int lowStockItems
    ) {
    }
}
