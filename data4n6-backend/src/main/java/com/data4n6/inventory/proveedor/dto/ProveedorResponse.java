package com.data4n6.inventory.proveedor.dto;

import java.util.UUID;

public record ProveedorResponse(
        UUID   id,
        String nombre,
        String nif,
        String contacto,
        String telefono,
        String email,
        String direccion,
        String notas
) {}
