package com.data4n6.inventory.orden;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t600_ordenes_adjudicacion", schema = "inventario")
public class OrdenAdjudicacion {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t600_ordenes_id")
    private Orden orden;

    @Column(name = "adjudicatario_id", nullable = false)
    private UUID adjudicatarioId;

    @Column(name = "adjudicatario_tabla", nullable = false, length = 100)
    private String adjudicatarioTabla;
}
