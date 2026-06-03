package com.data4n6.inventory.eventohistorial.repository;

import com.data4n6.inventory.eventohistorial.EventoHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EventoHistorialRepository extends JpaRepository<EventoHistorial, UUID> {

    @Query("""
        SELECT e FROM EventoHistorial e
        JOIN FETCH e.tipoEvento
        WHERE e.articulo.id = :articuloId
        ORDER BY e.createdAt DESC
        """)
    List<EventoHistorial> findByArticulo(@Param("articuloId") UUID articuloId);

    @Query("""
        SELECT e FROM EventoHistorial e
        JOIN FETCH e.articulo
        JOIN FETCH e.tipoEvento
        LEFT JOIN FETCH e.lineaOrden lo
        LEFT JOIN FETCH lo.orden
        WHERE e.articulo.id IN :articuloIds
        AND e.deletedAt IS NULL
        ORDER BY e.createdAt DESC
        """)
    List<EventoHistorial> findAllByArticuloIds(@Param("articuloIds") List<UUID> articuloIds);
}
