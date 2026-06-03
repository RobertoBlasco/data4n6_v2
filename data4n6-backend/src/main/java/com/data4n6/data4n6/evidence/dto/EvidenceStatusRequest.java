package com.data4n6.data4n6.evidence.dto;

import jakarta.validation.constraints.*;

public record EvidenceStatusRequest(

        @NotBlank
        String name,

        String color,

        @NotNull
        Integer displayOrder,

        @NotNull
        boolean active
) {}
