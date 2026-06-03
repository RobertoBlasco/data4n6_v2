package com.data4n6.inventory.estadoorden.dto;

import java.util.UUID;

public record EstadoOrdenResponse(
        UUID   id,
        String nombre,
        String descripcionCorta,
        String descripcion
) {}
