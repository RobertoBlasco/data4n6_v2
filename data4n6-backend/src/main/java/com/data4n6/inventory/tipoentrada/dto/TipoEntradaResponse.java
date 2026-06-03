package com.data4n6.inventory.tipoentrada.dto;

import java.util.UUID;

public record TipoEntradaResponse(
        UUID   id,
        String nombre,
        String descripcionCorta,
        String descripcion
) {}
