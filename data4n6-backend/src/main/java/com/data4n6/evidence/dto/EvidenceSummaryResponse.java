package com.data4n6.evidence.dto;

import java.time.Instant;
import java.util.UUID;

public record EvidenceSummaryResponse(

        UUID id,
        int sequenceNumber,
        String description,
        EvidenceStatusRef status,
        String condition,
        UUID exhibitId,
        Instant createdAt
) {}
