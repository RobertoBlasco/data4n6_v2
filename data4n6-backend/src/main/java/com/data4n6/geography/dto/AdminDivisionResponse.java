package com.data4n6.geography.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminDivisionResponse(

        UUID id,
        UUID countryId,
        String countryName,
        String isoCode,
        String name,
        String type,
        boolean active,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
