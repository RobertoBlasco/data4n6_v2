package com.data4n6.inventory.material;

import com.data4n6.common.entity.InventoryBaseEntity;
import com.data4n6.inventory.marca.T200Marca;
import com.data4n6.inventory.modelo.Modelo;
import com.data4n6.inventory.tipomaterial.TipoMaterial;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t100_materiales", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t100_materiales_id"))
public class Material extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_materiales_id", nullable = false)
    private TipoMaterial tipoMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_marcas_id")
    private T200Marca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_modelos_id")
    private Modelo modelo;
}
