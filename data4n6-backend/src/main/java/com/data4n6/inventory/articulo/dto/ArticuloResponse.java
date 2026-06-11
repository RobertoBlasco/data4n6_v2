package com.data4n6.inventory.articulo.dto;

import java.util.UUID;

public record ArticuloResponse(
        UUID   id,
        UUID   tipoMaterialId,
        String tipoMaterialNombre,
        UUID   brandId,
        String brandName,
        UUID   almacenId,
        String almacenNombre,
        UUID   modeloId,
        String modeloDescripcion,
        String serialNumber,
        String estadoActual,
        String descripcionEstado,
        long   numMovimientos,
        java.time.Instant ultimoMovimiento,
        UUID   ultimaOrdenId,
        String ultimaOrdenReferencia,
        long   numPrestamos,
        java.time.Instant fechaUltimoPrestamo,
        long   totalMismoTipo,
        long   disponiblesMismoTipo,
        long   numNotas,
        long   numFotos,
        long   numDocumentos,
        String ultimaNota
) {}
