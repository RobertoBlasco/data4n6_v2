package com.data4n6.inventory.marca;

import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_marcas", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t200_marcas_id"))
public class T200Marca extends InventoryBaseEntity {

    @Column(name = "nombre", nullable = false, length = 150)
    private String name;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String description;
}
