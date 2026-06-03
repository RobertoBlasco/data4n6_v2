package com.data4n6.inventory.propuesta.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PropuestaRequest(
        @NotNull UUID   eventoId,
        UUID            casosId,
        @Size(max = 100) String realizadoPor,
        String          notas
) {}
