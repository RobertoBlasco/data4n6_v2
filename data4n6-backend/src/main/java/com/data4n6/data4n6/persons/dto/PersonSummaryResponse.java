package com.data4n6.data4n6.persons.dto;

import java.time.Instant;
import java.util.UUID;

public record PersonSummaryResponse(
        UUID id,
        String firstName,
        String lastName,
        String nationalId,
        String roleName,
        String roleCode,
        Instant createdAt
) {}
