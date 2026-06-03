package com.data4n6.inventory.identdoc.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record IdentDocResponse(
        UUID      id,
        UUID      appTableId,
        String    tableName,
        UUID      recordId,
        UUID      docTypeId,
        String    docTypeName,
        String    numero,
        LocalDate fechaCaducidad,
        Instant   createdAt
) {}
