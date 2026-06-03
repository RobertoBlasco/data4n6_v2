package com.data4n6.inventory.propuesta.repository;

import com.data4n6.inventory.propuesta.LineaPropuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LineaPropuestaRepository extends JpaRepository<LineaPropuesta, UUID> {

    @Query("""
        SELECT l FROM LineaPropuesta l
        LEFT JOIN FETCH l.articulo
        LEFT JOIN FETCH l.categoria
        LEFT JOIN FETCH l.modelo
        LEFT JOIN FETCH l.almacen
        WHERE l.propuesta.id = :propuestaId
        ORDER BY l.orden
        """)
    List<LineaPropuesta> findByPropuesta(@Param("propuestaId") UUID propuestaId);
}
