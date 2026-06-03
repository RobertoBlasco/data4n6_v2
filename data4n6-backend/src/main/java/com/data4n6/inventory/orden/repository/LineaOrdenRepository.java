package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LineaOrdenRepository extends JpaRepository<LineaOrden, UUID> {
    List<LineaOrden> findByOrden_IdAndDeletedAtIsNullOrderByIdAsc(UUID ordenId);

    @Query("SELECT l.orden.id, COUNT(l) FROM LineaOrden l WHERE l.orden.id IN :ordenIds GROUP BY l.orden.id")
    List<Object[]> countByOrdenIds(@Param("ordenIds") List<UUID> ordenIds);
}
