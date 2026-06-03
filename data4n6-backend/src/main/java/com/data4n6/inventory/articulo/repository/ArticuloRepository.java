package com.data4n6.inventory.articulo.repository;

import com.data4n6.inventory.articulo.Articulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArticuloRepository extends JpaRepository<Articulo, UUID> {

    @Query("SELECT a FROM Articulo a LEFT JOIN FETCH a.tipoMaterial LEFT JOIN FETCH a.brand LEFT JOIN FETCH a.almacen LEFT JOIN FETCH a.modelo WHERE a.deletedAt IS NULL")
    List<Articulo> findAllActive();

    @Query("SELECT a FROM Articulo a LEFT JOIN FETCH a.tipoMaterial LEFT JOIN FETCH a.brand LEFT JOIN FETCH a.almacen LEFT JOIN FETCH a.modelo WHERE a.id = :id AND a.deletedAt IS NULL")
    Optional<Articulo> findActiveById(UUID id);

    boolean existsByBrandIdAndDeletedAtIsNull(UUID brandId);
    boolean existsByAlmacenIdAndDeletedAtIsNull(UUID almacenId);
}
