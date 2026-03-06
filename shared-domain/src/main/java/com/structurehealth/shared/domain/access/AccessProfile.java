package com.structurehealth.shared.domain.access;

import com.structurehealth.shared.domain.enums.OrganizationType;
import com.structurehealth.shared.domain.enums.PlatformRole;

import java.util.Set;

public record AccessProfile(
        PlatformRole role,
        OrganizationType organizationType,
        String organizationCode,
        String departmentCode,
        Set<String> permissions
) {
}

