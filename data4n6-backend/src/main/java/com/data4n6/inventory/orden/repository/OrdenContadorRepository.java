package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.OrdenContador;
import com.data4n6.inventory.orden.OrdenContadorId;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrdenContadorRepository extends JpaRepository<OrdenContador, OrdenContadorId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM OrdenContador c WHERE c.id.eventoId = :eventoId AND c.id.anio = :anio")
    Optional<OrdenContador> findForUpdate(@Param("eventoId") UUID eventoId, @Param("anio") short anio);
}
