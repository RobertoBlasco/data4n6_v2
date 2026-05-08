package com.data4n6.cases.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public record CaseStatusActionResponse(

        UUID id,
        UUID caseStatusId,
        Integer action,
        String behaviour,
        String createdBy,
        String updatedBy,
        Instant createdAt, 
        Instant updatedAt
) {}