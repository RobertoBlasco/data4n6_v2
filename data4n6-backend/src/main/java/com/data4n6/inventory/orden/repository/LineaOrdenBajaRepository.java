package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrdenBaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LineaOrdenBajaRepository extends JpaRepository<LineaOrdenBaja, UUID> {

    @Query("""
            SELECT lb FROM LineaOrdenBaja lb
            JOIN FETCH lb.lineaOrden lo
            JOIN FETCH lo.articulo a
            LEFT JOIN FETCH a.tipoMaterial
            LEFT JOIN FETCH a.brand
            LEFT JOIN FETCH a.modelo
            LEFT JOIN FETCH a.almacen
            WHERE lo.orden.id = :ordenId
              AND lo.deletedAt IS NULL
            ORDER BY lo.id
            """)
    List<LineaOrdenBaja> findByOrdenId(@Param("ordenId") UUID ordenId);
}
