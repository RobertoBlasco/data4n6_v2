package com.data4n6.inventory.propuesta.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LineaPropuestaResponse(
        UUID       id,
        UUID       propuestaId,
        UUID       articuloId,
        UUID       categoriaId,
        String     categoriaNombre,
        UUID       modeloId,
        String     modeloDescripcion,
        UUID       almacenId,
        String     almacenNombre,
        String     numeroSerie,
        BigDecimal precio,
        UUID       adjudicatarioId,
        String     adjudicatarioTabla,
        LocalDate  fechaDevolucion,
        String     notas,
        short      orden
) {}
