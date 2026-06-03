package com.data4n6.catalog.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record AgentResponse(
        UUID    id,
        String  callSign,
        String  firstName,
        String  lastName,
        UUID    unitId,
        String  unitName,
        boolean active,
        Instant deletedAt
) {
    @JsonProperty("displayName")
    public String displayName() {
        var sb = new StringBuilder();
        if (callSign != null && !callSign.isBlank()) sb.append(callSign).append(' ');
        if (firstName != null) sb.append(firstName);
        if (lastName != null && !lastName.isBlank()) sb.append(' ').append(lastName.strip());
        return sb.toString().strip();
    }
}
