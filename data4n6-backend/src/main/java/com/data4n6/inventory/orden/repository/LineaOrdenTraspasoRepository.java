package com.data4n6.inventory.orden.repository;

import com.data4n6.inventory.orden.LineaOrdenTraspaso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LineaOrdenTraspasoRepository extends JpaRepository<LineaOrdenTraspaso, UUID> {
}
