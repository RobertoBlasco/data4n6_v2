package com.data4n6.inventory.modelo.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ModeloRequest(
        @NotNull UUID tipoMaterialId,
        @NotNull UUID marcaId,
        String description
) {}
