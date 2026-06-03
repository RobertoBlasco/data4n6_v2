package com.data4n6.inventory.estadoorden.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.estadoorden.EstadoOrden;
import com.data4n6.inventory.estadoorden.dto.EstadoOrdenRequest;
import com.data4n6.inventory.estadoorden.dto.EstadoOrdenResponse;
import com.data4n6.inventory.estadoorden.repository.EstadoOrdenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EstadoOrdenService {

    private static final String TABLE = "t200_estados_ordenes";

    private final EstadoOrdenRepository repository;
    private final MetadataService metadataService;

    public List<EstadoOrdenResponse> findAll() {
        return repository.findByDeletedAtIsNullOrderByNombreAsc().stream().map(this::toResponse).toList();
    }

    public EstadoOrdenResponse findById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("EstadoOrden", id));
    }

    @Transactional
    public EstadoOrdenResponse create(EstadoOrdenRequest request) {
        EstadoOrden entity = new EstadoOrden();
        apply(entity, request);
        repository.save(entity);
        metadataService.onCreate(entity.getId(), TABLE);
        return toResponse(entity);
    }

    @Transactional
    public EstadoOrdenResponse update(UUID id, EstadoOrdenRequest request) {
        EstadoOrden entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EstadoOrden", id));
        apply(entity, request);
        repository.save(entity);
        metadataService.onUpdate(entity.getId());
        return toResponse(entity);
    }

    @Transactional
    public void delete(UUID id) {
        EstadoOrden entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EstadoOrden", id));
        entity.softDelete();
        repository.save(entity);
    }

    private void apply(EstadoOrden entity, EstadoOrdenRequest req) {
        entity.setNombre(req.nombre());
        entity.setDescripcionCorta(req.descripcionCorta());
        entity.setDescripcion(req.descripcion());
    }

    private EstadoOrdenResponse toResponse(EstadoOrden e) {
        return new EstadoOrdenResponse(e.getId(), e.getNombre(), e.getDescripcionCorta(), e.getDescripcion());
    }
}
