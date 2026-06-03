package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.OrdenPrestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdenPrestamoRepository extends JpaRepository<OrdenPrestamo, UUID> {

    @Query("SELECT op FROM OrdenPrestamo op JOIN FETCH op.orden o LEFT JOIN FETCH o.estadoOrden")
    List<OrdenPrestamo> findAllWithDetails();

    @Query("SELECT op FROM OrdenPrestamo op JOIN FETCH op.orden o LEFT JOIN FETCH o.estadoOrden WHERE op.id = :id")
    Optional<OrdenPrestamo> findByIdWithDetails(UUID id);
}
