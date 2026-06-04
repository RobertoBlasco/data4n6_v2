package com.data4n6.inventory.orden.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record OrdenDevolucionLibreRequest(
        @NotNull @Size(min = 1) List<UUID> articuloIds,
        UUID            agenteOrigenId,
        UUID            unidadOrigenId,
        UUID            agenteDestinoId,
        UUID            unidadDestinoId,
        LocalDate       fechaDevolucion,
        UUID            almacenDestinoId,
        Map<UUID, UUID> almacenPorArticulo
) {}
