package com.data4n6.inventory.eventotransicion.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EventoTransicionRequest(
        @NotNull UUID eventoOrigenId,
        @NotNull UUID eventoDestinoId
) {}
