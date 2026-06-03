package com.data4n6.inventory.materialmarca.repository;

import com.data4n6.inventory.materialmarca.MaterialMarca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaterialMarcaRepository extends JpaRepository<MaterialMarca, UUID> {

    @Query("SELECT m FROM MaterialMarca m JOIN FETCH m.tipoMaterial JOIN FETCH m.marca WHERE m.deletedAt IS NULL ORDER BY m.tipoMaterial.name, m.marca.name")
    List<MaterialMarca> findAllActive();

    @Query("SELECT m FROM MaterialMarca m JOIN FETCH m.tipoMaterial JOIN FETCH m.marca WHERE m.deletedAt IS NULL AND m.marca.id = :marcaId ORDER BY m.tipoMaterial.name")
    List<MaterialMarca> findActiveByMarca(@Param("marcaId") UUID marcaId);

    @Query("SELECT m FROM MaterialMarca m JOIN FETCH m.tipoMaterial JOIN FETCH m.marca WHERE m.deletedAt IS NULL AND m.tipoMaterial.id = :tipoMaterialId ORDER BY m.marca.name")
    List<MaterialMarca> findActiveByTipoMaterial(@Param("tipoMaterialId") UUID tipoMaterialId);

    @Query("SELECT m FROM MaterialMarca m WHERE m.deletedAt IS NULL AND m.tipoMaterial.id = :tipoMaterialId AND m.marca.id = :marcaId")
    Optional<MaterialMarca> findActiveByTipoMaterialAndMarca(@Param("tipoMaterialId") UUID tipoMaterialId, @Param("marcaId") UUID marcaId);
}
