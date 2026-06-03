package com.data4n6.inventory.propuesta.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LineaPropuestaRequest(
        UUID       articuloId,
        UUID       categoriaId,
        UUID       modeloId,
        UUID       almacenId,
        @Size(max = 100) String numeroSerie,
        BigDecimal precio,
        UUID       adjudicatarioId,
        @Size(max = 100) String adjudicatarioTabla,
        LocalDate  fechaDevolucion,
        String     notas,
        short      orden
) {}
