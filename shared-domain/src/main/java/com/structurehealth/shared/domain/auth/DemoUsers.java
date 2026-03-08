package com.structurehealth.shared.domain.auth;

import com.structurehealth.shared.domain.enums.PlatformRole;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public final class DemoUsers {

    public static final String GENERIC_PASSWORD = "password";

    private DemoUsers() {
    }

    public static List<DemoUserAccount> all() {
        return Arrays.stream(PlatformRole.values())
                .map(role -> new DemoUserAccount(toUsername(role), role))
                .toList();
    }

    public static String toUsername(PlatformRole role) {
        return role.name()
                .toLowerCase(Locale.ROOT)
                .replace('_', '-');
    }
}
