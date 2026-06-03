package com.data4n6.inventory.materialmarca.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MaterialMarcaRequest(
        @NotNull UUID tipoMaterialId,
        @NotNull UUID marcaId
) {}
