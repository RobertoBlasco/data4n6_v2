package com.data4n6.inventory.documento.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentoResponse(
        UUID    id,
        UUID    appTableId,
        String  tableName,
        UUID    recordId,
        UUID    documentTypeId,
        String  documentTypeName,
        String  filename,
        String  mimeType,
        String  filePath,
        String  description,
        Instant createdAt
) {}
