package com.data4n6.data4n6.cases.dto;

import jakarta.validation.constraints.*;

public record CaseOutcomeRequest(

        @NotBlank
        String name,

        @NotBlank
        String description,

        @NotNull
        Integer displayOrder,

        @NotNull
        boolean active
) {}