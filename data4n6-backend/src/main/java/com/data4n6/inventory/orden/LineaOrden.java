package com.data4n6.inventory.orden;

import com.data4n6.common.entity.InventoryBaseEntity;
import com.data4n6.inventory.articulo.Articulo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t650_ordenes", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t650_ordenes_id", updatable = false, nullable = false))
public class LineaOrden extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t600_ordenes_id", nullable = false)
    private Orden orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_articulos_id")
    private Articulo articulo;
}
