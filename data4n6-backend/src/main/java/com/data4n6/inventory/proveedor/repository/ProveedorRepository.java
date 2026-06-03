package com.data4n6.inventory.proveedor.repository;

import com.data4n6.inventory.proveedor.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProveedorRepository extends JpaRepository<Proveedor, UUID> {

    @Query("SELECT p FROM Proveedor p WHERE p.deletedAt IS NULL ORDER BY p.nombre")
    List<Proveedor> findAllActive();
}
