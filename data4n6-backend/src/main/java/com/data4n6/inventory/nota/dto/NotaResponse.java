package com.data4n6.inventory.nota.dto;

import java.time.Instant;
import java.util.UUID;

public record NotaResponse(
        UUID    id,
        UUID    appTableId,
        String  tableName,
        UUID    recordId,
        String  body,
        Instant createdAt
) {}
