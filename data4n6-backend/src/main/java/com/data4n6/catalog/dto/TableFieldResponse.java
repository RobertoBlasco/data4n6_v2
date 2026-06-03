package com.data4n6.catalog.dto;

import java.util.UUID;

public record TableFieldResponse(
        UUID    id,
        UUID    appTableId,
        String  fieldName,
        String  displayName,
        String  fieldType,
        boolean required,
        String  defaultValue,
        String  placeholder,
        String  endpoint,
        boolean visibleInGrid,
        boolean visibleInForm,
        Short   orden,
        Short   gridWidth,
        String  gridAlign
) {}
