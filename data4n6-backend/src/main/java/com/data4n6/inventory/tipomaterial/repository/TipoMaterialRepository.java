package com.data4n6.inventory.tipomaterial.repository;

import com.data4n6.inventory.tipomaterial.TipoMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TipoMaterialRepository extends JpaRepository<TipoMaterial, UUID> {

    @Query("SELECT m FROM TipoMaterial m WHERE m.deletedAt IS NULL ORDER BY m.name")
    List<TipoMaterial> findAllActive();

    boolean existsByName(String name);
}
