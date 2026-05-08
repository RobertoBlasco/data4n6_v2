package com.data4n6.cases.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.UUID;

public record CaseRequest(

        @NotBlank
        String title,

        String description,

        @NotNull
        UUID statusId,

        UUID classificationLevelId,

        UUID outcomeId,

        LocalDate closedDate,

        String outcomeNotes,

        UUID outcomeDocumentId,

        LocalDate retentionReviewDate,

        String retentionCategory
) {}
