package com.data4n6.inventory.estadoorden;

import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_estados_ordenes", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t200_estados_ordenes_id"))
public class EstadoOrden extends InventoryBaseEntity {

    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    @Column(name = "descripcion_corta", nullable = false, length = 20)
    private String descripcionCorta;

    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
