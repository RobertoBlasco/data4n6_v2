package com.data4n6.inventory.almacen;

import com.data4n6.common.entity.InventoryBaseEntity;
import com.data4n6.inventory.tipoalmacen.TipoAlmacen;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t100_almacenes", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t100_almacenes_id"))
public class Almacen extends InventoryBaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_almacenes_id")
    private TipoAlmacen tipoAlmacen;

    @Column(name = "is_reception", nullable = false)
    private boolean reception;
}
