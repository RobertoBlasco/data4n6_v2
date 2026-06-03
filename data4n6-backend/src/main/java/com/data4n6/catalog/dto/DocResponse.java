package com.data4n6.catalog.dto;

import java.time.Instant;
import java.util.UUID;

public record DocResponse(
        UUID    id,
        String  description,
        boolean active,
        Instant deletedAt
) {}
