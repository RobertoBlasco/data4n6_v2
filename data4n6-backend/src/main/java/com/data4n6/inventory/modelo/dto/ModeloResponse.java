package com.data4n6.inventory.modelo.dto;

import java.util.UUID;

public record ModeloResponse(
        UUID id,
        UUID tipoMaterialId,
        String tipoMaterialNombre,
        UUID marcaId,
        String marcaNombre,
        String description
) {}
