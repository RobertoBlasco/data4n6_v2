package com.data4n6.inventory.orden;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t650_ordenes_baja", schema = "inventario")
public class LineaOrdenBaja {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t650_ordenes_id")
    private LineaOrden lineaOrden;
}
