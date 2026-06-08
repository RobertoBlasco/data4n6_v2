package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrdenDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface LineaOrdenDevolucionRepository extends JpaRepository<LineaOrdenDevolucion, UUID> {

    @Query("SELECT COUNT(ld) FROM LineaOrdenDevolucion ld JOIN ld.lineaOrdenPrestamo lo WHERE lo.orden.id = :ordenPrestamoId")
    long countByOrdenPrestamoId(@Param("ordenPrestamoId") UUID ordenPrestamoId);

    @Query("""
            SELECT ld FROM LineaOrdenDevolucion ld
            JOIN FETCH ld.lineaOrden lo
            JOIN FETCH lo.orden
            WHERE ld.lineaOrdenPrestamo.id IN :lineaOrdenIds
            """)
    List<LineaOrdenDevolucion> findByLineaOrdenPrestamoIdIn(@Param("lineaOrdenIds") Set<UUID> lineaOrdenIds);

    @Query("""
            SELECT ld.lineaOrdenPrestamo.orden.id, COUNT(ld)
            FROM LineaOrdenDevolucion ld
            WHERE ld.lineaOrdenPrestamo.orden.id IN :ordenIds
            GROUP BY ld.lineaOrdenPrestamo.orden.id
            """)
    List<Object[]> countDevueltasByOrdenIds(@Param("ordenIds") List<UUID> ordenIds);

    @Query("""
            SELECT ld.lineaOrden.orden.id, COUNT(ld)
            FROM LineaOrdenDevolucion ld
            WHERE ld.lineaOrden.orden.id IN :ordenIds
            GROUP BY ld.lineaOrden.orden.id
            """)
    List<Object[]> countByDevolucionOrdenIds(@Param("ordenIds") List<UUID> ordenIds);

    @Query("""
            SELECT ld.lineaOrden.id, ld.lineaOrdenPrestamo.orden.id
            FROM LineaOrdenDevolucion ld
            WHERE ld.lineaOrden.id IN :lineaOrdenIds
            """)
    List<Object[]> findPrestamoOrdenIdsByLineaOrdenIds(
            @Param("lineaOrdenIds") List<UUID> lineaOrdenIds);

    @Query("""
            SELECT ld FROM LineaOrdenDevolucion ld
            JOIN FETCH ld.lineaOrden lo
            LEFT JOIN FETCH lo.articulo a
            LEFT JOIN FETCH a.tipoMaterial
            LEFT JOIN FETCH a.brand
            LEFT JOIN FETCH a.modelo
            LEFT JOIN FETCH a.almacen
            WHERE lo.orden.id = :devolucionId
            """)
    List<LineaOrdenDevolucion> findByDevolucionId(@Param("devolucionId") UUID devolucionId);
}
