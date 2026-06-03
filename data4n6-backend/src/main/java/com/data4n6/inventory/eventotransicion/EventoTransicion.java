package com.data4n6.inventory.eventotransicion;

import com.data4n6.inventory.evento.Evento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t250_eventos", schema = "inventario")
public class EventoTransicion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t250_eventos_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_eventos_origen_id", nullable = false)
    private Evento eventoOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_eventos_destino_id", nullable = false)
    private Evento eventoDestino;
}
