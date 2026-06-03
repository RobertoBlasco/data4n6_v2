package com.data4n6.inventory.orden;

import com.data4n6.inventory.almacen.Almacen;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t650_ordenes_traspaso", schema = "inventario")
public class LineaOrdenTraspaso {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t650_ordenes_id")
    private LineaOrden lineaOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_almacenes_origen_id", nullable = false)
    private Almacen almacenOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_almacenes_destino_id", nullable = false)
    private Almacen almacenDestino;
}
