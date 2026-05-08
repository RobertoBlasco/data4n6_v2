package com.data4n6.exhibits.dto;

import jakarta.validation.constraints.*;

public record ExhibitStatusRequest(

        @NotBlank
        String name,

        String color,

        @NotNull
        Integer displayOrder,

        @NotNull
        boolean active
) {}
