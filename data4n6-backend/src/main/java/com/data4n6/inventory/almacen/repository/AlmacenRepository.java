package com.data4n6.inventory.almacen.repository;

import com.data4n6.inventory.almacen.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AlmacenRepository extends JpaRepository<Almacen, UUID> {

    @Query("SELECT a FROM Almacen a LEFT JOIN FETCH a.tipoAlmacen WHERE a.deletedAt IS NULL ORDER BY a.name")
    List<Almacen> findAllActive();
}
