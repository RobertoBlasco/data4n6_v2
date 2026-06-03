package com.data4n6.inventory.material.repository;

import com.data4n6.inventory.material.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaterialRepository extends JpaRepository<Material, UUID> {

    @Query("SELECT m FROM Material m JOIN FETCH m.tipoMaterial LEFT JOIN FETCH m.marca LEFT JOIN FETCH m.modelo WHERE m.deletedAt IS NULL ORDER BY m.tipoMaterial.name, m.marca.name")
    List<Material> findAllActive();

    @Query("SELECT m FROM Material m JOIN FETCH m.tipoMaterial LEFT JOIN FETCH m.marca LEFT JOIN FETCH m.modelo WHERE m.id = :id AND m.deletedAt IS NULL")
    Optional<Material> findActiveById(UUID id);
}
