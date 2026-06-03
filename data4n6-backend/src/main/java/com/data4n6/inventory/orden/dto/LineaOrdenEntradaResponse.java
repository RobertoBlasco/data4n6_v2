package com.data4n6.inventory.orden.dto;

import java.util.UUID;

public record LineaOrdenEntradaResponse(
        UUID   id,
        UUID   marcaId,
        String marcaNombre,
        UUID   modeloId,
        String modeloDescripcion,
        String numeroSerie,
        UUID   tipoMaterialId,
        String tipoMaterialNombre,
        UUID   almacenId,
        String almacenNombre
) {}
