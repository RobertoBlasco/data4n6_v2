package com.data4n6.inventory.propuesta.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record AprobarRequest(
        @Size(max = 100) String aprobadoPor,

        // ADJ + PRS — adjudicación / préstamo
        UUID   adjudicatarioId,
        @Size(max = 100) String adjudicatarioTabla,

        // PRS — préstamo (fecha prevista de devolución)
        LocalDate fechaDevolucion
) {}
