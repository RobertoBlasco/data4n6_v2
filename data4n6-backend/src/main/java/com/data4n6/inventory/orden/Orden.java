package com.data4n6.inventory.orden;

import com.data4n6.inventory.estadoorden.EstadoOrden;
import com.data4n6.inventory.evento.Evento;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t600_ordenes", schema = "inventario")
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t600_ordenes_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_eventos_id")
    private Evento tipoEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_estados_ordenes_id")
    private EstadoOrden estadoOrden;

    @Column(name = "numero_referencia", nullable = false, length = 30, unique = true)
    private String numeroReferencia;

    @Column(name = "aprobado_por", length = 100)
    private String aprobadoPor;

    @Column(name = "aprobado_en", nullable = false)
    private Instant aprobadoEn = Instant.now();

    @Column(name = "fecha_inicio")
    private Instant fechaInicio;

    @Column(name = "fecha_fin")
    private Instant fechaFin;

    @Column(name = "deleted_at")
    private Instant deletedAt;

}
