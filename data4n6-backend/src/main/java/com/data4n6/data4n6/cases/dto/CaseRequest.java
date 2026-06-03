package com.data4n6.data4n6.cases.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.UUID;

public record CaseRequest(

        String reference,

        @NotBlank
        String title,

        String description,

        UUID statusId,

        UUID classificationLevelId,

        UUID outcomeId,

        LocalDate closedDate,

        String outcomeNotes,

        UUID outcomeDocumentId,

        LocalDate retentionReviewDate,

        String retentionCategory
) {}
