package com.data4n6.catalog.dto;

public record PictureTypeRequest(
        String  name,
        String  description,
        boolean active
) {}
