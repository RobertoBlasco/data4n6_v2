package com.data4n6.inventory.orden.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrdenPrestamoRequest(
        UUID      agenteOrigenId,
        @NotNull UUID      unidadOrigenId,
        UUID      agenteDestinoId,
        UUID      unidadDestinoId,
        @NotNull LocalDate fechaInicio,
        LocalDate fechaDevolucion,
        UUID      casosId,
        @NotNull @Size(min = 1) List<UUID> articulosIds
) {}
