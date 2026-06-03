package com.data4n6.inventory.orden;

import com.data4n6.inventory.almacen.Almacen;
import com.data4n6.inventory.marca.T200Marca;
import com.data4n6.inventory.modelo.Modelo;
import com.data4n6.inventory.proveedor.Proveedor;
import com.data4n6.inventory.tipomaterial.TipoMaterial;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t650_ordenes_entrada", schema = "inventario")
public class LineaOrdenEntrada {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t650_ordenes_id")
    private LineaOrden lineaOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_proveedores_id")
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_marcas_id")
    private T200Marca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_modelos_id")
    private Modelo modelo;

    @Column(name = "numero_serie", length = 100)
    private String numeroSerie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_materiales_id")
    private TipoMaterial tipoMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_almacenes_id")
    private Almacen almacen;
}
