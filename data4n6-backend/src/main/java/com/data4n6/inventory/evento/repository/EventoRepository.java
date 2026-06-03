package com.data4n6.inventory.evento.repository;

import com.data4n6.inventory.evento.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EventoRepository extends JpaRepository<Evento, UUID> {

    @Query("SELECT e FROM Evento e ORDER BY e.nombre")
    List<Evento> findAllActive();
}
