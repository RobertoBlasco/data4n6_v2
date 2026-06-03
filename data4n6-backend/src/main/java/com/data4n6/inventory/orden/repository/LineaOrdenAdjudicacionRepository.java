package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrdenAdjudicacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LineaOrdenAdjudicacionRepository extends JpaRepository<LineaOrdenAdjudicacion, UUID> {
}
