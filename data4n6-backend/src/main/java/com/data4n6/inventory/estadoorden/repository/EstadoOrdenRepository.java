package com.data4n6.inventory.estadoorden.repository;

import com.data4n6.inventory.estadoorden.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EstadoOrdenRepository extends JpaRepository<EstadoOrden, UUID> {
    List<EstadoOrden> findByDeletedAtIsNullOrderByNombreAsc();
    Optional<EstadoOrden> findByNombreAndDeletedAtIsNull(String nombre);
}
