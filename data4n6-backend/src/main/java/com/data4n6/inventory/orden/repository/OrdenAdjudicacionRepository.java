package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.OrdenAdjudicacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrdenAdjudicacionRepository extends JpaRepository<OrdenAdjudicacion, UUID> {}
