package com.data4n6.inventory.evento;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t200_eventos", schema = "inventario")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t200_eventos_id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 200, unique = true)
    private String nombre;

    @Column(name = "descripcion_corta", length = 10)
    private String descripcionCorta;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "permite_propuesta", nullable = false)
    private boolean permitePropuesta;

    @Column(name = "prefijo_referencia", length = 10)
    private String prefijoReferencia;
}
