package com.data4n6.data4n6.evidence.dto;

import java.time.Instant;
import java.util.UUID;

public record EvidenceResponse(

        UUID id,
        UUID eventId,
        UUID exhibitId,
        EvidenceStatusRef status,
        int sequenceNumber,
        String description,
        String condition,
        String hashMd5,
        String hashSha256,
        Long sizeBytes,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
