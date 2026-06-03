package com.data4n6.inventory.materialactivo.dto;

import java.time.Instant;
import java.util.UUID;

public record MaterialActivoResponse(
        UUID    id,
        UUID    articuloId,
        UUID    almacenId,
        String  almacenNombre,
        UUID    estadoId,
        String  estadoNombre,
        UUID    ultimoEventoId,
        UUID    adjudicatarioId,
        String  adjudicatarioTabla,
        Instant updatedAt
) {}
