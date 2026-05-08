package com.data4n6.cases.dto;

import jakarta.validation.constraints.*;

public record CaseStatusRequest(

        @NotBlank
        String name,

        @NotBlank
        String color,

        @NotNull
        Integer displayOrder,

        @NotNull
        boolean active
) {}