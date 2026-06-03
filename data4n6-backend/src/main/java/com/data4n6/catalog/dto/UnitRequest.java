package com.data4n6.catalog.dto;

public record UnitRequest(
        String  code,
        String  name,
        String  description,
        boolean active,
        boolean forInventory,
        boolean forData4n6
) {}
