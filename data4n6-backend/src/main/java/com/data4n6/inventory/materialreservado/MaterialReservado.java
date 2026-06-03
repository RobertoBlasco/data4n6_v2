package com.data4n6.inventory.materialreservado;

import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.propuesta.Propuesta;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t400_materiales_reservados", schema = "inventario")
public class MaterialReservado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t400_materiales_reservados_id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_articulos_id", nullable = false, unique = true)
    private Articulo articulo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t400_propuestas_id", nullable = false)
    private Propuesta propuesta;

    @Column(name = "reservado_por", length = 100)
    private String reservadoPor;

    @Column(name = "reservado_en", nullable = false)
    private Instant reservadoEn = Instant.now();

    @Column(name = "expira_en", nullable = false)
    private Instant expiraEn;
}
