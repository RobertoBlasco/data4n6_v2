package com.data4n6.inventory.orden.dto;

import java.time.Instant;
import java.util.UUID;

public record OrdenDevolucionListResponse(
        UUID    id,
        String  numeroReferencia,
        Instant aprobadoEn,
        String  ordenPrestamoReferencia,
        String  agenteNombre,
        String  unidadNombre,
        int     numLineasDevueltas
) {}
