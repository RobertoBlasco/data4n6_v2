package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrdenPrestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LineaOrdenPrestamoRepository extends JpaRepository<LineaOrdenPrestamo, UUID> {

    @Query("""
            SELECT lp FROM LineaOrdenPrestamo lp
            JOIN FETCH lp.lineaOrden lo
            JOIN FETCH lo.articulo a
            LEFT JOIN FETCH a.tipoMaterial
            LEFT JOIN FETCH a.brand
            LEFT JOIN FETCH a.modelo
            LEFT JOIN FETCH a.almacen
            WHERE lo.orden.id = :ordenId
              AND lo.deletedAt IS NULL
            ORDER BY lo.id
            """)
    List<LineaOrdenPrestamo> findByOrdenId(@Param("ordenId") UUID ordenId);

    @Query("""
            SELECT lp FROM LineaOrdenPrestamo lp
            JOIN FETCH lp.lineaOrden lo
            JOIN FETCH lo.articulo a
            LEFT JOIN FETCH a.tipoMaterial
            LEFT JOIN FETCH a.brand
            LEFT JOIN FETCH a.modelo
            LEFT JOIN FETCH a.almacen
            WHERE lo.orden.id = :ordenId
              AND lo.deletedAt IS NULL
              AND NOT EXISTS (
                SELECT ld FROM LineaOrdenDevolucion ld
                WHERE ld.lineaOrdenPrestamo = lo
              )
            ORDER BY lo.id
            """)
    List<LineaOrdenPrestamo> findPendientesByOrdenId(@Param("ordenId") UUID ordenId);

    @Query("SELECT COUNT(lp) FROM LineaOrdenPrestamo lp JOIN lp.lineaOrden lo WHERE lo.orden.id = :ordenId AND lo.deletedAt IS NULL")
    long countByOrdenId(@Param("ordenId") UUID ordenId);

    @Query("""
            SELECT lp FROM LineaOrdenPrestamo lp
            JOIN FETCH lp.lineaOrden lo
            JOIN FETCH lo.orden o
            JOIN FETCH lo.articulo a
            LEFT JOIN FETCH a.tipoMaterial
            LEFT JOIN FETCH a.brand
            LEFT JOIN FETCH a.modelo
            LEFT JOIN FETCH a.almacen
            WHERE a.id IN :articuloIds
              AND lo.deletedAt IS NULL
              AND NOT EXISTS (
                SELECT ld FROM LineaOrdenDevolucion ld
                WHERE ld.lineaOrdenPrestamo = lo
              )
            """)
    List<LineaOrdenPrestamo> findPendientesByArticuloIds(@Param("articuloIds") List<UUID> articuloIds);
}
