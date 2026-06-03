package com.data4n6.inventory.propuesta;

import com.data4n6.inventory.evento.Evento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t400_propuestas", schema = "inventario")
public class Propuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t400_propuestas_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_eventos_id", nullable = false)
    private Evento evento;

    @Column(name = "numero_referencia", nullable = false, length = 30, unique = true)
    private String numeroReferencia;

    @Column(nullable = false, length = 20)
    private String estado = "borrador";

    @Column(name = "t100_casos_id")
    private UUID casosId;

    @Column(name = "realizado_por", length = 100)
    private String realizadoPor;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public boolean isDeleted() { return deletedAt != null; }

    public void softDelete() { this.deletedAt = Instant.now(); }
}
