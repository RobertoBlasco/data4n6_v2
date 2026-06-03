package com.data4n6.inventory.orden;

import com.data4n6.inventory.evento.Evento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t600_ordenes_contador", schema = "inventario")
public class OrdenContador {

    @EmbeddedId
    private OrdenContadorId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventoId")
    @JoinColumn(name = "t200_eventos_id")
    private Evento evento;

    @Column(name = "ultimo_numero", nullable = false)
    private int ultimoNumero;
}
