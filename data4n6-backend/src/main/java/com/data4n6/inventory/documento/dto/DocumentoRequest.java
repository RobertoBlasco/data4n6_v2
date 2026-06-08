package com.data4n6.inventory.documento.dto;

import java.util.UUID;

public record DocumentoRequest(
        UUID   appTableId,
        UUID   recordId,
        UUID   documentTypeId,
        String title,
        String originalFilename,
        String mimeType,
        String filePath,
        String storedFilename,
        Long   fileSizeBytes,
        String description
) {}
