package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrdenEntrada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LineaOrdenEntradaRepository extends JpaRepository<LineaOrdenEntrada, UUID> {

    @Query("""
            SELECT le FROM LineaOrdenEntrada le
            JOIN FETCH le.lineaOrden lo
            LEFT JOIN FETCH le.marca
            LEFT JOIN FETCH le.modelo
            LEFT JOIN FETCH le.tipoMaterial
            LEFT JOIN FETCH le.almacen
            WHERE lo.orden.id = :ordenId
            ORDER BY lo.id
            """)
    List<LineaOrdenEntrada> findByOrdenId(@Param("ordenId") UUID ordenId);
}
