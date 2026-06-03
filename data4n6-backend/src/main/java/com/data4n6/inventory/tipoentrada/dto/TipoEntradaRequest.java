package com.data4n6.inventory.tipoentrada.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TipoEntradaRequest(
        @NotBlank @Size(max = 150) String nombre,
        @NotBlank @Size(max = 10)  String descripcionCorta,
        String descripcion
) {}
