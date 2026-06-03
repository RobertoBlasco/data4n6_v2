package com.data4n6.data4n6.units.dto;

import java.time.Instant;
import java.util.UUID;

public record UnitResponse(
        UUID id,
        UUID parentId,
        String parentName,
        String code,
        String name,
        String description,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
