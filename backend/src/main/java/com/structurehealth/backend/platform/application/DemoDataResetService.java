package com.structurehealth.backend.platform.application;

import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class DemoDataResetService {

    private final DataSource dataSource;
    private final ResourceLoader resourceLoader;
    private final JdbcTemplate jdbcTemplate;

    public DemoDataResetService(DataSource dataSource, ResourceLoader resourceLoader, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.resourceLoader = resourceLoader;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'HOSPITAL_ADMIN')")
    public DemoResetSummary resetDemoData(String triggeredBy) {
        executeScript("classpath:database/demo-reset.sql");
        executeScript("classpath:database/demo-seed.sql");
        recordAuditEvent(triggeredBy);

        return new DemoResetSummary(
                triggeredBy,
                count("organization"),
                count("patient_profile"),
                count("appointment"),
                count("encounter"),
                count("department_task"),
                count("claim_case"),
                count("inventory_item")
        );
    }

    private void executeScript(String location) {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                false,
                false,
                StandardCharsets.UTF_8.name(),
                resourceLoader.getResource(location)
        );
        populator.execute(dataSource);
    }

    private void recordAuditEvent(String triggeredBy) {
        jdbcTemplate.update(
                "insert into audit_event (id, user_account_id, entity_type, entity_id, action, details) " +
                        "values (?, null, 'DEMO_DATA', null, 'RESET', ?)",
                UUID.randomUUID(),
                "Demo dataset reset by " + triggeredBy
        );
    }

    private int count(String tableName) {
        Integer value = jdbcTemplate.queryForObject("select count(*) from " + tableName, Integer.class);
        return value == null ? 0 : value;
    }
}
