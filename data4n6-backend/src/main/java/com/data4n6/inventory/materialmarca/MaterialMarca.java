package com.data4n6.inventory.materialmarca;

import com.data4n6.common.entity.InventoryBaseEntity;
import com.data4n6.inventory.marca.T200Marca;
import com.data4n6.inventory.tipomaterial.TipoMaterial;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t250_materiales_marcas", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t250_materiales_marcas_id"))
public class MaterialMarca extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_materiales_id", nullable = false)
    private TipoMaterial tipoMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_marcas_id", nullable = false)
    private T200Marca marca;
}
