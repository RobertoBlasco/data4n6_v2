package com.data4n6.inventory.propuesta.repository;

import com.data4n6.inventory.propuesta.PropuestaContador;
import com.data4n6.inventory.propuesta.PropuestaContadorId;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PropuestaContadorRepository extends JpaRepository<PropuestaContador, PropuestaContadorId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM PropuestaContador c WHERE c.id.eventoId = :eventoId AND c.id.anio = :anio")
    Optional<PropuestaContador> findForUpdate(@Param("eventoId") UUID eventoId, @Param("anio") short anio);
}
