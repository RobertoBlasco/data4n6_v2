package com.data4n6.data4n6.events.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public record EventRequest(

        @NotNull UUID caseId,
        @NotNull UUID statusId,
        @NotBlank String title,
        String description,
        String locationAddress,
        String locationCity,
        String locationCoordinates,
        UUID countryId,
        UUID adminDivisionId,
        Instant scheduledAt
) {}
