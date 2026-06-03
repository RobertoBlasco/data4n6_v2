package com.data4n6.inventory.materialactivo;

import com.data4n6.inventory.almacen.Almacen;
import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.eventohistorial.EventoHistorial;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t400_materiales_activos", schema = "inventario")
public class MaterialActivo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t400_materiales_activos_id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_articulos_id", nullable = false, unique = true)
    private Articulo articulo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_almacenes_id")
    private Almacen almacen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t300_eventos_id")
    private EventoHistorial ultimoEvento;

    @Column(name = "adjudicatario_id")
    private UUID adjudicatarioId;

    @Column(name = "adjudicatario_tabla", length = 100)
    private String adjudicatarioTabla;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
