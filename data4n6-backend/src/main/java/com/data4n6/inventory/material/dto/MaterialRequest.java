package com.data4n6.inventory.material.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MaterialRequest(
        @NotNull UUID tipoMaterialId,
        UUID marcaId,
        UUID modeloId
) {}
