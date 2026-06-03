package com.data4n6.inventory.propuesta.repository;

import com.data4n6.inventory.propuesta.Propuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropuestaRepository extends JpaRepository<Propuesta, UUID> {

    @Query("SELECT p FROM Propuesta p JOIN FETCH p.evento WHERE p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    List<Propuesta> findAllActive();

    @Query("SELECT p FROM Propuesta p JOIN FETCH p.evento WHERE p.deletedAt IS NULL AND p.evento.id = :eventoId ORDER BY p.createdAt DESC")
    List<Propuesta> findActiveByEvento(@Param("eventoId") UUID eventoId);

    @Query("SELECT p FROM Propuesta p JOIN FETCH p.evento WHERE p.id = :id")
    Optional<Propuesta> findByIdWithEvento(@Param("id") UUID id);
}
