package com.data4n6.inventory.eventotransicion.dto;

import java.util.UUID;

public record AccionDisponibleResponse(
        UUID eventoId,
        String nombre,
        String descripcionCorta,
        String prefijoReferencia
) {}
