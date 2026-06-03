package com.data4n6.inventory.evento.dto;

import java.util.UUID;

public record EventoResponse(
        UUID id,
        String nombre,
        String descripcionCorta,
        String descripcion,
        boolean permitePropuesta,
        String prefijoReferencia
) {}
