package com.data4n6.inventory.tipoalmacen.dto;

import java.util.UUID;

public record TipoAlmacenResponse(UUID id, String code, String name, String description) {}
