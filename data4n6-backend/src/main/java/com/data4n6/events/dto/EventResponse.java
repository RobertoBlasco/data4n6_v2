package com.data4n6.events.dto;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(

        UUID id,
        UUID caseId,
        EventStatusRef status,
        String title,
        String description,
        String locationAddress,
        String locationCity,
        String locationCoordinates,
        UUID countryId,
        UUID adminDivisionId,
        Instant scheduledAt,
        Instant startedAt,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
