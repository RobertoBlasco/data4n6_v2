package com.data4n6.data4n6.cases.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CaseResponse(

        UUID id,
        String reference,
        String title,
        String description,
        CaseStatusRef status,
        UUID classificationLevelId,
        CaseOutcomeRef outcome,
        LocalDate closedDate,
        String outcomeNotes,
        UUID outcomeDocumentId,
        LocalDate retentionReviewDate,
        String retentionCategory,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}
