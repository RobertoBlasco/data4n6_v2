package com.data4n6.data4n6.exhibits.dto;

import java.time.Instant;
import java.util.UUID;

public record ExhibitResponse(

        UUID id,
        UUID eventId,
        ExhibitStatusRef status,
        int sequenceNumber,
        String description,
        String make,
        String model,
        String serialNumber,
        String condition,
        String fieldLocation,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
