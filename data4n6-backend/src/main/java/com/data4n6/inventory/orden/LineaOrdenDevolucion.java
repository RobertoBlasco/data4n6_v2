package com.data4n6.inventory.orden;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t650_ordenes_devolucion", schema = "inventario")
public class LineaOrdenDevolucion {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t650_ordenes_id")
    private LineaOrden lineaOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t650_ordenes_prestamo_id", nullable = false)
    private LineaOrden lineaOrdenPrestamo;
}
