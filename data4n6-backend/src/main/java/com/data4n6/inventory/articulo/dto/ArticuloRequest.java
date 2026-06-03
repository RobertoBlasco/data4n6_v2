package com.data4n6.inventory.articulo.dto;

import java.util.UUID;

public record ArticuloRequest(
        UUID   tipoMaterialId,
        UUID   brandId,
        UUID   almacenId,
        UUID   modeloId,
        String serialNumber
) {}
