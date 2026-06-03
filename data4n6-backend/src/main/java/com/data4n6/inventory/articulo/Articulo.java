package com.data4n6.inventory.articulo;

import com.data4n6.common.entity.InventoryBaseEntity;
import com.data4n6.inventory.marca.T200Marca;
import com.data4n6.inventory.almacen.Almacen;
import com.data4n6.inventory.modelo.Modelo;
import com.data4n6.inventory.tipomaterial.TipoMaterial;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t100_articulos", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t100_articulos_id"))
public class Articulo extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_marcas_id")
    private T200Marca brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_almacenes_id")
    private Almacen almacen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_modelos_id")
    private Modelo modelo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_materiales_id")
    private TipoMaterial tipoMaterial;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;
}
