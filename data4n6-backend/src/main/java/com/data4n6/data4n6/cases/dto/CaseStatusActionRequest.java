package com.data4n6.data4n6.cases.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public record CaseStatusActionRequest(

        @NotNull
        UUID caseStatusId,

        @NotBlank
        Integer action,

        @NotBlank
        String behaviour
) {}