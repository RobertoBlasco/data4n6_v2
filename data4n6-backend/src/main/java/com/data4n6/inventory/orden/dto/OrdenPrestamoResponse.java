package com.data4n6.inventory.orden.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record OrdenPrestamoResponse(
        UUID      id,
        String    numeroReferencia,
        String    aprobadoPor,
        Instant   aprobadoEn,
        Instant   fechaInicio,
        Instant   fechaFin,

        UUID      agenteOrigenId,
        String    agenteOrigenNombre,
        UUID      unidadOrigenId,
        String    unidadOrigenNombre,
        UUID      agenteDestinoId,
        String    agenteDestinoNombre,
        UUID      unidadDestinoId,
        String    unidadDestinoNombre,

        LocalDate fechaDevolucion,

        UUID      estadoOrdenId,
        String    estadoOrdenNombre,

        UUID      casosId,
        String    casosReference,

        long      numLineas,
        long      numLineasDevueltas
) {}
