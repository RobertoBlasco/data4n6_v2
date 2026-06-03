package com.data4n6.data4n6.cases.dto;

import java.util.UUID;
import java.time.Instant;

public record CaseStatusResponse(

        UUID id,
        String name,
        String color,
        Integer displayOrder,
        boolean active,
        String createdBy,
        String updatedBy,
        Instant createdAt,
        Instant updatedAt
) {}