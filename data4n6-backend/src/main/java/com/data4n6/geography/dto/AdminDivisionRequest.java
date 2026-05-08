package com.data4n6.geography.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record AdminDivisionRequest(

        @NotNull
        UUID countryId,

        @Size(max = 10)
        String isoCode,

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 50)
        String type,

        boolean active
) {}
