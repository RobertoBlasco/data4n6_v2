package com.data4n6.inventory.articulo.dto;

import java.time.Instant;
import java.util.UUID;

public record ArticuloMovimientoResponse(
        UUID    id,
        Instant fecha,
        String  tipoEvento,
        String  estadoResultante,
        String  descripcion,
        String  ordenReferencia,
        String  estadoOrden,
        String  detalle,
        UUID    ordenId,
        String  ordenCategoria,
        UUID    ordenPrestamoId   // solo para categoría "devolucion"
) {}
