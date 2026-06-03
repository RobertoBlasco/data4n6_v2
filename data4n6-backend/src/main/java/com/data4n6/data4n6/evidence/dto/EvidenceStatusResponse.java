package com.data4n6.data4n6.evidence.dto;

import java.time.Instant;
import java.util.UUID;

public record EvidenceStatusResponse(

        UUID id,
        String name,
        String color,
        Integer displayOrder,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
