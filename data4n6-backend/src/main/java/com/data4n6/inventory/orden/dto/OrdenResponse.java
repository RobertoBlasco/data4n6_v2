package com.data4n6.inventory.orden.dto;

import java.time.Instant;
import java.util.UUID;

public record OrdenResponse(
        UUID    id,
        String  numeroReferencia,
        String  aprobadoPor,
        Instant aprobadoEn,
        Instant fechaInicio,
        Instant fechaFin,

        UUID    tipoEventoId,
        String  tipoEventoNombre,
        UUID    estadoOrdenId,
        String  estadoOrdenNombre
) {}
