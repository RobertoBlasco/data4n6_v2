package com.data4n6.inventory.orden;

import com.data4n6.inventory.tipoentrada.TipoEntrada;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t600_ordenes_entrada", schema = "inventario")
public class OrdenEntrada {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t600_ordenes_id")
    private Orden orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_entradas_almacen_id", nullable = false)
    private TipoEntrada tipoEntrada;

}
