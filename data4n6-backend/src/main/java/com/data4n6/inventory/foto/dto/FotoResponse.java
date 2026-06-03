package com.data4n6.inventory.foto.dto;

import java.time.Instant;
import java.util.UUID;

public record FotoResponse(
        UUID    id,
        UUID    appTableId,
        String  tableName,
        UUID    recordId,
        UUID    pictureTypeId,
        String  pictureTypeName,
        boolean esPrincipal,
        String  filename,
        String  mimeType,
        String  filePath,
        String  caption,
        Instant createdAt
) {}
