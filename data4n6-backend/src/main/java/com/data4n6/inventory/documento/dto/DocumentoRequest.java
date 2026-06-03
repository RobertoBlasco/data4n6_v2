package com.data4n6.inventory.documento.dto;

import java.util.UUID;

public record DocumentoRequest(
        UUID   appTableId,
        UUID   recordId,
        UUID   documentTypeId,
        String filename,
        String mimeType,
        String filePath,
        String description
) {}
