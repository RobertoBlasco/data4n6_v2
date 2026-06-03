package com.data4n6.inventory.propuesta.dto;

import java.time.Instant;
import java.util.UUID;

public record PropuestaResponse(
        UUID    id,
        UUID    eventoId,
        String  eventoNombre,
        String  eventoPrefijo,
        String  numeroReferencia,
        String  estado,
        UUID    casosId,
        String  realizadoPor,
        String  notas,
        Instant createdAt,
        Instant updatedAt
) {}
