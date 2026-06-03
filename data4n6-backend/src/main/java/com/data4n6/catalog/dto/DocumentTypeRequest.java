package com.data4n6.catalog.dto;

public record DocumentTypeRequest(
        String  name,
        String  description,
        boolean active
) {}
