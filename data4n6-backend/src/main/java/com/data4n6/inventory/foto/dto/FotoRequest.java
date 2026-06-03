package com.data4n6.inventory.foto.dto;

import java.util.UUID;

public record FotoRequest(
        UUID   appTableId,
        UUID   recordId,
        UUID    pictureTypeId,
        boolean esPrincipal,
        String  filename,
        String mimeType,
        String filePath,
        String caption
) {}
