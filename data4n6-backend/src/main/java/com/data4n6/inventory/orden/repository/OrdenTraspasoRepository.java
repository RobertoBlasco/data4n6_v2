package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.OrdenTraspaso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrdenTraspasoRepository extends JpaRepository<OrdenTraspaso, UUID> {}
