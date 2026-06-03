package com.data4n6.inventory.proveedor;

import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_proveedores", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t200_proveedores_id"))
public class Proveedor extends InventoryBaseEntity {

    @Column(nullable = false, length = 200, unique = true)
    private String nombre;

    @Column(length = 20)
    private String nif;

    @Column(length = 150)
    private String contacto;

    @Column(length = 30)
    private String telefono;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(columnDefinition = "TEXT")
    private String notas;
}
