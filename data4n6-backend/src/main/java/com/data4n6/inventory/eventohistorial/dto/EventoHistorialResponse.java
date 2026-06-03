package com.data4n6.inventory.eventohistorial.dto;

import java.time.Instant;
import java.util.UUID;

public record EventoHistorialResponse(
        UUID    id,
        UUID    tipoEventoId,
        String  tipoEventoNombre,
        UUID    articuloId,
        UUID    lineaOrdenId,
        Instant fechaIni,
        Instant fechaFin,
        Instant createdAt
) {}
