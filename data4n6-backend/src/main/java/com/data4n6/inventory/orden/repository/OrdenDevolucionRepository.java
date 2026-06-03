package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.OrdenDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OrdenDevolucionRepository extends JpaRepository<OrdenDevolucion, UUID> {

    List<OrdenDevolucion> findByOrdenPrestamo_Id(UUID ordenPrestamoId);

    @Query("SELECT od FROM OrdenDevolucion od JOIN FETCH od.orden o JOIN FETCH od.ordenPrestamo op")
    List<OrdenDevolucion> findAllWithDetails();
}
