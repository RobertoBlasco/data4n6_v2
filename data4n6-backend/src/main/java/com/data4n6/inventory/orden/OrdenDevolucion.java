package com.data4n6.inventory.orden;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t600_ordenes_devolucion", schema = "inventario")
public class OrdenDevolucion {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t600_ordenes_id")
    private Orden orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t600_ordenes_prestamo_id", nullable = false)
    private Orden ordenPrestamo;
}
