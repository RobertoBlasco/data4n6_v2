package com.data4n6.inventory.propuesta;

import com.data4n6.inventory.almacen.Almacen;
import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.categoriarticulo.CategoriaArticulo;
import com.data4n6.inventory.modelo.Modelo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t400_lineas_propuesta", schema = "inventario")
public class LineaPropuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t400_lineas_propuesta_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t400_propuestas_id", nullable = false)
    private Propuesta propuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_articulos_id")
    private Articulo articulo;

    // Used for Entrada lines: the category to assign to the new article
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_articulos_id")
    private CategoriaArticulo categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_modelos_id")
    private Modelo modelo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_almacenes_id")
    private Almacen almacen;

    @Column(name = "numero_serie", length = 100)
    private String numeroSerie;

    @Column(precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(name = "adjudicatario_id")
    private UUID adjudicatarioId;

    @Column(name = "adjudicatario_tabla", length = 100)
    private String adjudicatarioTabla;

    @Column(name = "fecha_devolucion")
    private LocalDate fechaDevolucion;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false)
    private short orden = 1;
}
