package com.data4n6.inventory.eventohistorial;

import com.data4n6.common.entity.InventoryBaseEntity;
import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.evento.Evento;
import com.data4n6.inventory.orden.LineaOrden;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "t300_eventos", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t300_eventos_id", updatable = false, nullable = false))
public class EventoHistorial extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_eventos_id", nullable = false)
    private Evento tipoEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_articulos_id", nullable = false)
    private Articulo articulo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t650_ordenes_id")
    private LineaOrden lineaOrden;

    @Column(name = "fecha_ini")
    private Instant fechaIni;

    @Column(name = "fecha_fin")
    private Instant fechaFin;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "estado_resultante", length = 100)
    private String estadoResultante;

    @Column(name = "descripcion_estado", length = 200)
    private String descripcionEstado;
}
