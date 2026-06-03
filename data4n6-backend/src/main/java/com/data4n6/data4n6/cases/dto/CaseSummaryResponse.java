package com.data4n6.data4n6.cases.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record CaseSummaryResponse(

        UUID id,
        String reference,
        String title,
        CaseStatusRef status,
        UUID classificationLevelId,
        Instant createdAt
) {
    @JsonProperty("displayName")
    public String displayName() {
        String ref = (reference != null && !reference.isBlank()) ? reference + " — " : "";
        return ref + (title != null ? title : "");
    }
}
