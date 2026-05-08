package com.data4n6.cases.dto;

import java.time.Instant;
import java.util.UUID;

public record CaseSummaryResponse(

        UUID id,
        String code,
        String title,
        CaseStatusRef status,
        UUID classificationLevelId,
        Instant createdAt
) {}
