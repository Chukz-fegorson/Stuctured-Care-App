package com.structurehealth.shared.domain.auth;

import com.structurehealth.shared.domain.enums.PlatformRole;

public record DemoUserAccount(
        String username,
        PlatformRole role
) {
}
