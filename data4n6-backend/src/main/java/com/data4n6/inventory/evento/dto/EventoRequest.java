package com.data4n6.inventory.evento.dto;

import jakarta.validation.constraints.NotBlank;

public record EventoRequest(
        @NotBlank String nombre,
        String descripcionCorta,
        @NotBlank String descripcion
) {}
