package com.data4n6.inventory.marca.repository;

import com.data4n6.inventory.marca.T200Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface T200MarcaRepository extends JpaRepository<T200Marca, UUID> {

    @Query("SELECT b FROM T200Marca b WHERE b.deletedAt IS NULL ORDER BY b.name")
    List<T200Marca> findAllActive();

    boolean existsByName(String name);
}
