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
        String  originalFilename,
        String  mimeType,
        String  filePath,
        String  caption,
        Long    fileSizeBytes,
        String  thumbnailPath,
        Integer width,
        Integer height,
        Instant takenAt,
        Instant createdAt
) {}
