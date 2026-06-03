package com.data4n6.catalog.dto;

import java.time.Instant;
import java.util.UUID;

public record UnitResponse(
        UUID    id,
        String  code,
        String  name,
        String  description,
        boolean active,
        Instant deletedAt,
        boolean forInventory,
        boolean forData4n6
) {}
