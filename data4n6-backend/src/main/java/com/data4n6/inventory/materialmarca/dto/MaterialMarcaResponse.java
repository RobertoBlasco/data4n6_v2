package com.data4n6.inventory.materialmarca.dto;

import java.util.UUID;

public record MaterialMarcaResponse(
        UUID id,
        UUID tipoMaterialId,
        String tipoMaterialNombre,
        UUID marcaId,
        String marcaNombre
) {}
