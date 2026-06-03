package com.data4n6.inventory.orden;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t600_ordenes_prestamo", schema = "inventario")
public class OrdenPrestamo {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "t600_ordenes_id")
    private Orden orden;

    @Column(name = "t100_agentes_origen_id")
    private UUID agenteOrigenId;

    @Column(name = "t100_unidades_origen_id")
    private UUID unidadOrigenId;

    @Column(name = "t100_agentes_destino_id")
    private UUID agenteDestinoId;

    @Column(name = "t100_unidades_destino_id")
    private UUID unidadDestinoId;

    @Column(name = "fecha_devolucion")
    private LocalDate fechaDevolucion;

    @Column(name = "t100_casos_id")
    private UUID casosId;
}
