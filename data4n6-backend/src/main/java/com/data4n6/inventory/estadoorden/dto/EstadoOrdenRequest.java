package com.data4n6.inventory.estadoorden.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EstadoOrdenRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 20)  String descripcionCorta,
        String descripcion
) {}
