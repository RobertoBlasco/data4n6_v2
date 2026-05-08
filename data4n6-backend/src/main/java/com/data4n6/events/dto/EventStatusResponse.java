package com.data4n6.events.dto;

import java.time.Instant;
import java.util.UUID;

public record EventStatusResponse(

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
