package com.data4n6.inventory.orden.dto;

import java.util.UUID;

public record LineaOrdenResponse(
        UUID    id,
        UUID    ordenId,
        UUID    articuloId,
        String  articuloSerialNumber,
        UUID    lineaPropuestaId,
        short   posicion
) {}
