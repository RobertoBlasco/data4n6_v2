package com.data4n6.inventory.categoriarticulo.repository;

import com.data4n6.inventory.categoriarticulo.CategoriaArticulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface CategoriaArticuloRepository extends JpaRepository<CategoriaArticulo, UUID> {

    @Query("SELECT c FROM CategoriaArticulo c WHERE c.deletedAt IS NULL ORDER BY c.name")
    List<CategoriaArticulo> findAllActive();
}
