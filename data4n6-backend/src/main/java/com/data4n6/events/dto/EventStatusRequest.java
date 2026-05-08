package com.data4n6.events.dto;

import jakarta.validation.constraints.*;

public record EventStatusRequest(

        @NotBlank
        String name,

        String color,

        @NotNull
        Integer displayOrder,

        @NotNull
        boolean active
) {}
