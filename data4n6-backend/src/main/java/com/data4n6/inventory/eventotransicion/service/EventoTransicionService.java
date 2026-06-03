package com.data4n6.inventory.eventotransicion.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.evento.Evento;
import com.data4n6.inventory.evento.repository.EventoRepository;
import com.data4n6.inventory.eventotransicion.EventoTransicion;
import com.data4n6.inventory.eventotransicion.dto.AccionDisponibleResponse;
import com.data4n6.inventory.eventotransicion.dto.EventoTransicionRequest;
import com.data4n6.inventory.eventotransicion.dto.EventoTransicionResponse;
import com.data4n6.inventory.eventotransicion.repository.EventoTransicionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventoTransicionService {

    private static final String TABLE = "t250_eventos";

    private final EventoTransicionRepository repository;
    private final EventoRepository eventoRepository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<EventoTransicionResponse> findAll() {
        return repository.findAllWithFetch().stream().map(mapper::toResponse).toList();
    }

    public List<EventoTransicionResponse> findByOrigen(UUID origenId) {
        return repository.findAllByOrigen(origenId).stream().map(mapper::toResponse).toList();
    }

    public EventoTransicionResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("EventoTransicion", id));
    }

    @Transactional
    public EventoTransicionResponse create(EventoTransicionRequest request) {
        EventoTransicion et = new EventoTransicion();
        applyRequest(et, request);
        repository.save(et);
        metadataService.onCreate(et.getId(), TABLE);
        return mapper.toResponse(et);
    }

    @Transactional
    public EventoTransicionResponse update(UUID id, EventoTransicionRequest request) {
        EventoTransicion et = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EventoTransicion", id));
        applyRequest(et, request);
        repository.save(et);
        metadataService.onUpdate(et.getId());
        return mapper.toResponse(et);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("EventoTransicion", id);
        }
        repository.deleteById(id);
    }

    // Maps estadoActual → origin event UUIDs (from V27 initial seed, V46 comment, V135).
    // 001=ENT, 002=TRS, 003=ADJ, 004=PRS, 005=REP, 006=BAJ, 007=DEV, 008=FRP, 009=DAD
    private static final Map<String, List<UUID>> ESTADO_ORIGEN_IDS = Map.of(
            "Almacén", List.of(
                UUID.fromString("10000000-0000-0000-0000-000000000001"),  // ENT
                UUID.fromString("10000000-0000-0000-0000-000000000002"),  // TRS
                UUID.fromString("10000000-0000-0000-0000-000000000007"),  // DEV Préstamo
                UUID.fromString("10000000-0000-0000-0000-000000000008"),  // FRP Fin Reparación
                UUID.fromString("10000000-0000-0000-0000-000000000009")   // DAD Adjudicación
            ),
            "Prestado",      List.of(UUID.fromString("10000000-0000-0000-0000-000000000004")),  // PRS
            "Adjudicado",    List.of(UUID.fromString("10000000-0000-0000-0000-000000000003")),  // ADJ
            "En reparación", List.of(UUID.fromString("10000000-0000-0000-0000-000000000005"))   // REP
            // "Baja" → empty → immediate return
    );

    public List<AccionDisponibleResponse> findAccionesDisponibles(List<String> estados) {
        var distinctEstados = estados.stream().distinct().toList();

        Set<UUID> intersection = null;
        for (String estado : distinctEstados) {
            var origenIds = ESTADO_ORIGEN_IDS.getOrDefault(estado, List.of());
            if (origenIds.isEmpty()) return List.of();

            var destinos = repository.findDestinoIdsByOrigenIds(origenIds);
            if (destinos.isEmpty()) return List.of();

            if (intersection == null) {
                intersection = new HashSet<>(destinos);
            } else {
                intersection.retainAll(destinos);
                if (intersection.isEmpty()) return List.of();
            }
        }

        if (intersection == null || intersection.isEmpty()) return List.of();

        return eventoRepository.findAllById(intersection).stream()
                .map(e -> new AccionDisponibleResponse(
                        e.getId(), e.getNombre(), e.getDescripcionCorta(), e.getPrefijoReferencia()))
                .sorted((a, b) -> a.nombre().compareToIgnoreCase(b.nombre()))
                .toList();
    }

    private void applyRequest(EventoTransicion et, EventoTransicionRequest req) {
        et.setEventoOrigen(resolveEvento(req.eventoOrigenId()));
        et.setEventoDestino(resolveEvento(req.eventoDestinoId()));
    }

    private Evento resolveEvento(UUID id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", id));
    }
}
