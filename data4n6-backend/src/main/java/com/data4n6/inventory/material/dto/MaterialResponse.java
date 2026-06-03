package com.data4n6.inventory.material.dto;

import java.util.UUID;

public record MaterialResponse(
        UUID id,
        UUID tipoMaterialId,
        String tipoMaterialNombre,
        UUID marcaId,
        String marcaNombre,
        UUID modeloId,
        String modeloDescripcion
) {}
