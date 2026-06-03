package com.data4n6.data4n6.exhibits.dto;

import java.time.Instant;
import java.util.UUID;

public record ExhibitSummaryResponse(

        UUID id,
        int sequenceNumber,
        String description,
        String make,
        String model,
        String serialNumber,
        ExhibitStatusRef status,
        String condition,
        Instant createdAt
) {}
