package com.data4n6.inventory.eventotransicion.dto;

import java.util.UUID;

public record EventoTransicionResponse(
        UUID id,
        UUID eventoOrigenId,
        String eventoOrigenNombre,
        UUID eventoDestinoId,
        String eventoDestinoNombre
) {}
