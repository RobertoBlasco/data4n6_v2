package com.data4n6.inventory.orden.dto;

import java.time.Instant;
import java.util.UUID;

public record OrdenEntradaResponse(
        UUID    id,
        String  numeroReferencia,
        String  aprobadoPor,
        Instant aprobadoEn,
        Instant fechaInicio,
        Instant fechaFin,

        UUID    tipoEntradaId,
        String  tipoEntradaNombre,
        String  tipoEntradaDescripcionCorta,

        UUID    estadoOrdenId,
        String  estadoOrdenNombre,

        long    numLineas
) {}
