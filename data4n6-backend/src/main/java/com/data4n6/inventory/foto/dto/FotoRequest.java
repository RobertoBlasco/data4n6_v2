package com.data4n6.inventory.foto.dto;

import java.util.UUID;

public record FotoRequest(
        UUID    appTableId,
        UUID    recordId,
        UUID    pictureTypeId,
        boolean esPrincipal,
        String  originalFilename,
        String  mimeType,
        String  filePath,
        String  storedFilename,
        Long    fileSizeBytes,
        String  caption
) {}
