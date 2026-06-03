package com.data4n6.inventory.orden.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.orden.LineaOrdenEntrada;
import com.data4n6.inventory.orden.OrdenEntrada;
import com.data4n6.inventory.orden.dto.LineaOrdenEntradaResponse;
import com.data4n6.inventory.orden.dto.OrdenEntradaResponse;
import com.data4n6.inventory.orden.repository.LineaOrdenEntradaRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenRepository;
import com.data4n6.inventory.orden.repository.OrdenEntradaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdenEntradaService {

    private final OrdenEntradaRepository      repository;
    private final LineaOrdenRepository        lineaOrdenRepository;
    private final LineaOrdenEntradaRepository lineaOrdenEntradaRepository;

    public List<OrdenEntradaResponse> findAll() {
        var ordenes = repository.findAllWithDetails();
        var ids     = ordenes.stream().map(oe -> oe.getOrden().getId()).toList();
        var counts  = countMap(ids);
        return ordenes.stream().map(oe -> toResponse(oe, counts)).toList();
    }

    public OrdenEntradaResponse findById(UUID id) {
        return repository.findByIdWithDetails(id)
                .map(oe -> toResponse(oe, countMap(List.of(oe.getOrden().getId()))))
                .orElseThrow(() -> new ResourceNotFoundException("OrdenEntrada", id));
    }

    private Map<UUID, Long> countMap(List<UUID> ids) {
        return lineaOrdenRepository.countByOrdenIds(ids).stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (Long) row[1]));
    }

    public List<LineaOrdenEntradaResponse> findLineasByOrdenId(UUID ordenId) {
        return lineaOrdenEntradaRepository.findByOrdenId(ordenId).stream()
                .map(this::toLineaResponse)
                .toList();
    }

    private LineaOrdenEntradaResponse toLineaResponse(LineaOrdenEntrada le) {
        var marca        = le.getMarca();
        var modelo       = le.getModelo();
        var tipoMaterial = le.getTipoMaterial();
        var almacen      = le.getAlmacen();
        return new LineaOrdenEntradaResponse(
                le.getId(),
                marca        != null ? marca.getId()              : null,
                marca        != null ? marca.getName()            : null,
                modelo       != null ? modelo.getId()             : null,
                modelo       != null ? modelo.getDescription()    : null,
                le.getNumeroSerie(),
                tipoMaterial != null ? tipoMaterial.getId()       : null,
                tipoMaterial != null ? tipoMaterial.getName()     : null,
                almacen      != null ? almacen.getId()            : null,
                almacen      != null ? almacen.getName()          : null
        );
    }

    private OrdenEntradaResponse toResponse(OrdenEntrada oe, Map<UUID, Long> counts) {
        var orden  = oe.getOrden();
        var estado = orden.getEstadoOrden();
        return new OrdenEntradaResponse(
                oe.getId(),
                orden.getNumeroReferencia(),
                orden.getAprobadoPor(),
                orden.getAprobadoEn(),
                orden.getFechaInicio(),
                orden.getFechaFin(),
                oe.getTipoEntrada().getId(),
                oe.getTipoEntrada().getNombre(),
                oe.getTipoEntrada().getDescripcionCorta(),
                estado != null ? estado.getId()     : null,
                estado != null ? estado.getNombre() : null,
                counts.getOrDefault(orden.getId(), 0L));
    }
}
