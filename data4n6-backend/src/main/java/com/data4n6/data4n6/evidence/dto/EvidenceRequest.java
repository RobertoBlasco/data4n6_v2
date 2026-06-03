package com.data4n6.data4n6.evidence.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record EvidenceRequest(

        @NotNull
        UUID eventId,

        UUID exhibitId,

        @NotNull
        UUID statusId,

        @NotBlank
        String description,

        String hashMd5,
        String hashSha256,
        Long sizeBytes,
        String notes
) {}
