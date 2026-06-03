package com.data4n6.inventory.tipomaterial;

import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_materiales", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t200_materiales_id"))
public class TipoMaterial extends InventoryBaseEntity {

    @Column(nullable = false, length = 150, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
