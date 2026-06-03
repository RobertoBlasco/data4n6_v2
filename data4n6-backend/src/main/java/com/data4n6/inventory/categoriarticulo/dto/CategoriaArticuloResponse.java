package com.data4n6.inventory.categoriarticulo.dto;

import java.util.UUID;

public record CategoriaArticuloResponse(UUID id, String code, String name, String description) {}
