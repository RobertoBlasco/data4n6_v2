package com.data4n6.inventory.eventotransicion.repository;

import com.data4n6.inventory.eventotransicion.EventoTransicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EventoTransicionRepository extends JpaRepository<EventoTransicion, UUID> {

    @Query("SELECT et FROM EventoTransicion et JOIN FETCH et.eventoOrigen JOIN FETCH et.eventoDestino ORDER BY et.eventoOrigen.nombre, et.eventoDestino.nombre")
    List<EventoTransicion> findAllWithFetch();

    @Query("SELECT et FROM EventoTransicion et JOIN FETCH et.eventoOrigen JOIN FETCH et.eventoDestino WHERE et.eventoOrigen.id = :origenId ORDER BY et.eventoDestino.nombre")
    List<EventoTransicion> findAllByOrigen(UUID origenId);

    @Query("SELECT DISTINCT et.eventoDestino.id FROM EventoTransicion et WHERE et.eventoOrigen.id IN :origenIds")
    java.util.Set<UUID> findDestinoIdsByOrigenIds(@org.springframework.data.repository.query.Param("origenIds") java.util.List<UUID> origenIds);
}
