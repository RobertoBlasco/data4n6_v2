package com.data4n6.inventory.orden.dto;

import java.time.Instant;
import java.util.UUID;

public record OrdenBajaResponse(
        UUID    id,
        String  numeroReferencia,
        String  aprobadoPor,
        Instant aprobadoEn,
        Instant fechaInicio,
        Instant fechaFin,
        UUID    estadoOrdenId,
        String  estadoOrdenNombre,
        long    numLineas
) {}
