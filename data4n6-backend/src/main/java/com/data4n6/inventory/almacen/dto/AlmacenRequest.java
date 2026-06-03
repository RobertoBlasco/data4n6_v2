package com.data4n6.inventory.almacen.dto;

import java.util.UUID;

public record AlmacenRequest(UUID tipoAlmacenId, String name, String description, boolean reception) {}
