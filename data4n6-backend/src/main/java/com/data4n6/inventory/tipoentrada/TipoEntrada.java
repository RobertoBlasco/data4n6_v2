package com.data4n6.inventory.tipoentrada;

import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_entradas_almacen", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t200_entradas_almacen_id"))
public class TipoEntrada extends InventoryBaseEntity {

    @Column(nullable = false, length = 150, unique = true)
    private String nombre;

    @Column(name = "descripcion_corta", nullable = false, length = 10, unique = true)
    private String descripcionCorta;

    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
