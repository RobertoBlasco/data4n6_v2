package com.data4n6.inventory.identdoc.dto;

import java.time.LocalDate;
import java.util.UUID;

public record IdentDocRequest(
        UUID      appTableId,
        UUID      recordId,
        UUID      docTypeId,
        String    numero,
        LocalDate fechaCaducidad
) {}
