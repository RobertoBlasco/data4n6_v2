package com.data4n6.catalog.dto;

import java.util.UUID;

public record AppResponse(
        UUID   id,
        String name,
        String displayName,
        String description,
        String icono
) {}
