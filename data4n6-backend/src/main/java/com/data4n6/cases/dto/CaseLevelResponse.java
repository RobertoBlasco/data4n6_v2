package com.data4n6.cases.dto;

import java.time.Instant;
import java.util.UUID;

public record CaseLevelResponse(

        UUID id,
        String name,
        Integer level,
        String description,
        String color,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
