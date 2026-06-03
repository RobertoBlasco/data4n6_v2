package com.data4n6.data4n6.units.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UnitRequest(

        UUID parentId,

        @NotBlank
        String code,

        @NotBlank
        String name,

        String description,

        @NotNull
        boolean active
) {}
