package com.data4n6.cases.dto;

import jakarta.validation.constraints.*;

public record CaseLevelRequest(

        @NotBlank
        String name,

        @NotNull
        Integer level,

        String description,

        String color,

        @NotNull
        boolean active
) {}
