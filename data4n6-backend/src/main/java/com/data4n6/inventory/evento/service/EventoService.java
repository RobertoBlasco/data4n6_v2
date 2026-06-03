package com.data4n6.inventory.evento.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.evento.Evento;
import com.data4n6.inventory.evento.dto.EventoRequest;
import com.data4n6.inventory.evento.dto.EventoResponse;
import com.data4n6.inventory.evento.repository.EventoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventoService {

    private static final String TABLE = "t200_eventos";

    private final EventoRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<EventoResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public EventoResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", id));
    }

    @Transactional
    public EventoResponse create(EventoRequest request) {
        Evento evento = new Evento();
        applyRequest(evento, request);
        repository.save(evento);
        metadataService.onCreate(evento.getId(), TABLE);
        return mapper.toResponse(evento);
    }

    @Transactional
    public EventoResponse update(UUID id, EventoRequest request) {
        Evento evento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento", id));
        applyRequest(evento, request);
        repository.save(evento);
        metadataService.onUpdate(evento.getId());
        return mapper.toResponse(evento);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Evento", id);
        }
        repository.deleteById(id);
    }

    private void applyRequest(Evento evento, EventoRequest req) {
        evento.setNombre(req.nombre());
        evento.setDescripcionCorta(req.descripcionCorta());
        evento.setDescripcion(req.descripcion());
    }
}
