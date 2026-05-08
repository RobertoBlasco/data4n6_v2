package com.data4n6.cases.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CaseDomainRequest(

        UUID parentId,

        @NotBlank
        String name,

        String description,

        @NotNull
        Integer displayOrder,

        @NotNull
        boolean active
) {}
