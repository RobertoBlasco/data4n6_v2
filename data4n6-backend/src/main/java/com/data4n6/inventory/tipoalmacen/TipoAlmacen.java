package com.data4n6.inventory.tipoalmacen;

import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_almacenes", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t200_almacenes_id"))
public class TipoAlmacen extends InventoryBaseEntity {

    @Column(length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
