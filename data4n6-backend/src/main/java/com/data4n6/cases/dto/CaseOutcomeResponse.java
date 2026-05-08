package com.data4n6.cases.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public record CaseOutcomeResponse(

        UUID id,
        String name,
        String description,
        Integer displayOrder,
        Boolean active,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}