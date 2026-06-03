package com.data4n6.inventory.orden.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.orden.Orden;
import com.data4n6.inventory.orden.dto.OrdenResponse;
import com.data4n6.inventory.orden.repository.OrdenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdenService {

    private final OrdenRepository repository;

    public List<OrdenResponse> findAll() {
        return repository.findAllWithPropuesta().stream().map(this::toResponse).toList();
    }

    public List<OrdenResponse> findByEvento(UUID eventoId) {
        return repository.findByEvento(eventoId).stream().map(this::toResponse).toList();
    }

    public OrdenResponse findById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Orden", id));
    }

    private OrdenResponse toResponse(Orden o) {
        return new OrdenResponse(
                o.getId(),
                o.getNumeroReferencia(),
                o.getAprobadoPor(),
                o.getAprobadoEn(),
                o.getFechaInicio(),
                o.getFechaFin(),
                o.getTipoEvento()  != null ? o.getTipoEvento().getId()     : null,
                o.getTipoEvento()  != null ? o.getTipoEvento().getNombre() : null,
                o.getEstadoOrden() != null ? o.getEstadoOrden().getId()    : null,
                o.getEstadoOrden() != null ? o.getEstadoOrden().getNombre() : null);
    }
}
