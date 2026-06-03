package com.data4n6.data4n6.cases.dto;

import java.time.Instant;
import java.util.UUID;

public record CaseDomainResponse(
        UUID id,
        UUID parentId,
        String parentName,
        String name,
        String description,
        Integer displayOrder,
        boolean active,
        String createdBy,
        String updatedBy,
        Instant createdAt,
        Instant updatedAt
) {}
