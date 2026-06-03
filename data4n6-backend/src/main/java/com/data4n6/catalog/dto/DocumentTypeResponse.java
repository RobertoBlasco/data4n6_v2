package com.data4n6.catalog.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentTypeResponse(
        UUID    id,
        String  name,
        String  description,
        boolean active,
        Instant deletedAt
) {}
