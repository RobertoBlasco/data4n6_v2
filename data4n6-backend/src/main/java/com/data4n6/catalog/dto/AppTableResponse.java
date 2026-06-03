package com.data4n6.catalog.dto;

import java.util.UUID;

public record AppTableResponse(
        UUID        id,
        String      tableName,
        String      displayName,
        String      description,
        String      nombreSingular,
        String      nombrePlural,
        String      icono,
        String      vistas,
        String      endpointBase,
        String      seccionMenu,
        Short       ordenMenu,
        String      formFields,
        String      dbSchema,
        String      formRoute,
        AppResponse application
) {}
