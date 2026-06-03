package com.data4n6.catalog.dto;

import java.util.UUID;

public record AppTableRequest(
        String tableName,
        String displayName,
        String description,
        String nombreSingular,
        String nombrePlural,
        String icono,
        String vistas,
        String endpointBase,
        String seccionMenu,
        Short  ordenMenu,
        String formFields,
        String dbSchema,
        UUID   applicationId
) {}
