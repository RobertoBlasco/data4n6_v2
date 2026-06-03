package com.data4n6.inventory.proveedor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProveedorRequest(
        @NotBlank @Size(max = 200) String nombre,
        @Size(max = 20)  String nif,
        @Size(max = 150) String contacto,
        @Size(max = 30)  String telefono,
        @Size(max = 150) String email,
        String direccion,
        String notas
) {}
