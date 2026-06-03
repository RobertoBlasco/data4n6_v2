package com.data4n6.inventory.orden.dto;

import java.util.UUID;

public record OrdenDevolucionResponse(
        UUID   id,
        String numeroReferencia,
        UUID   ordenPrestamoId,
        String ordenPrestamoReferencia,
        int    numLineasDevueltas,
        boolean prestamoCompletado
) {}
