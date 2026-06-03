package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrdenRepository extends JpaRepository<Orden, UUID> {

    @Query("SELECT o FROM Orden o LEFT JOIN FETCH o.tipoEvento LEFT JOIN FETCH o.estadoOrden ORDER BY o.aprobadoEn DESC")
    List<Orden> findAllWithPropuesta();

    @Query("SELECT o FROM Orden o LEFT JOIN FETCH o.tipoEvento LEFT JOIN FETCH o.estadoOrden WHERE o.tipoEvento.id = :eventoId ORDER BY o.aprobadoEn DESC")
    List<Orden> findByEvento(@Param("eventoId") UUID eventoId);
}
