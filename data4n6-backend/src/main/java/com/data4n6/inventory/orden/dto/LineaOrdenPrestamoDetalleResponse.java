package com.data4n6.inventory.orden.dto;

import java.time.Instant;
import java.util.UUID;

public record LineaOrdenPrestamoDetalleResponse(
        UUID   id,
        UUID   articuloId,
        String articuloSerialNumber,
        UUID   tipoMaterialId,
        String tipoMaterialNombre,
        UUID   marcaId,
        String marcaNombre,
        UUID   modeloId,
        String modeloDescripcion,
        UUID   almacenId,
        String almacenNombre,
        boolean devuelta,
        String  ordenDevolucionReferencia,
        Instant fechaDevolucion
) {}
