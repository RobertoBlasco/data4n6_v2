package com.data4n6.inventory.orden;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t650_ordenes_prestamo", schema = "inventario")
public class LineaOrdenPrestamo {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t650_ordenes_id")
    private LineaOrden lineaOrden;

    @Column(name = "estado_previo", length = 50)
    private String estadoPrevio;

    @Column(name = "almacen_previo_id")
    private UUID almacenPrevioId;
}
