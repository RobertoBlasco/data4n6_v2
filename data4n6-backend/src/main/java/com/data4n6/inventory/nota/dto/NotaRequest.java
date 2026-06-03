package com.data4n6.inventory.nota.dto;

import java.util.UUID;

public record NotaRequest(
        UUID   appTableId,
        UUID   recordId,
        String body
) {}
