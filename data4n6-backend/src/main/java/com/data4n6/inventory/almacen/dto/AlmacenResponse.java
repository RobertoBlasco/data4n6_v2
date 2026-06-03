package com.data4n6.inventory.almacen.dto;

import java.util.UUID;

public record AlmacenResponse(UUID id, UUID tipoAlmacenId, String tipoAlmacenNombre, String name, String description, boolean reception) {}
