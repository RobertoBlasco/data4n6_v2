package com.data4n6.exhibits.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record ExhibitRequest(

        @NotNull
        UUID eventId,

        @NotNull
        UUID statusId,

        @NotBlank
        String description,

        String make,
        String model,
        String serialNumber,
        String fieldLocation,
        String notes
) {}
