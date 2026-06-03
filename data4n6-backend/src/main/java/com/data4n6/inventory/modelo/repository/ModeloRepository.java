package com.data4n6.inventory.modelo.repository;

import com.data4n6.inventory.modelo.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ModeloRepository extends JpaRepository<Modelo, UUID> {

    @Query("SELECT m FROM Modelo m JOIN FETCH m.tipoMaterial JOIN FETCH m.marca WHERE m.deletedAt IS NULL ORDER BY m.marca.name, m.description")
    List<Modelo> findAllActive();

    @Query("SELECT m FROM Modelo m JOIN FETCH m.tipoMaterial JOIN FETCH m.marca WHERE m.deletedAt IS NULL AND m.marca.id = :marcaId ORDER BY m.tipoMaterial.name, m.description")
    List<Modelo> findActiveByMarca(@Param("marcaId") UUID marcaId);
}
