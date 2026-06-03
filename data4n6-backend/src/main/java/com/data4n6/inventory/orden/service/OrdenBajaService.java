package com.data4n6.inventory.orden.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.orden.LineaOrdenBaja;
import com.data4n6.inventory.orden.dto.LineaOrdenBajaResponse;
import com.data4n6.inventory.orden.dto.OrdenBajaResponse;
import com.data4n6.inventory.orden.repository.LineaOrdenBajaRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenRepository;
import com.data4n6.inventory.orden.repository.OrdenRepository;
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
public class OrdenBajaService {

    private static final UUID BAJ_EVENTO_ID = UUID.fromString("10000000-0000-0000-0000-000000000006");

    private final OrdenRepository         ordenRepository;
    private final LineaOrdenRepository    lineaOrdenRepository;
    private final LineaOrdenBajaRepository lineaBajaRepository;

    public List<OrdenBajaResponse> findAll() {
        var ordenes = ordenRepository.findByEvento(BAJ_EVENTO_ID);
        var ids     = ordenes.stream().map(o -> o.getId()).toList();
        var counts  = countMap(ids);
        return ordenes.stream().map(o -> {
            var estado = o.getEstadoOrden();
            return new OrdenBajaResponse(
                    o.getId(), o.getNumeroReferencia(), o.getAprobadoPor(), o.getAprobadoEn(),
                    o.getFechaInicio(), o.getFechaFin(),
                    estado != null ? estado.getId() : null,
                    estado != null ? estado.getNombre() : null,
                    counts.getOrDefault(o.getId(), 0L));
        }).toList();
    }

    public OrdenBajaResponse findById(UUID id) {
        var o = ordenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenBaja", id));
        var counts = countMap(List.of(id));
        var estado = o.getEstadoOrden();
        return new OrdenBajaResponse(
                o.getId(), o.getNumeroReferencia(), o.getAprobadoPor(), o.getAprobadoEn(),
                o.getFechaInicio(), o.getFechaFin(),
                estado != null ? estado.getId() : null,
                estado != null ? estado.getNombre() : null,
                counts.getOrDefault(id, 0L));
    }

    public List<LineaOrdenBajaResponse> findLineasByOrdenId(UUID ordenId) {
        return lineaBajaRepository.findByOrdenId(ordenId).stream()
                .map(this::toLineaResponse)
                .toList();
    }

    private Map<UUID, Long> countMap(List<UUID> ids) {
        return lineaOrdenRepository.countByOrdenIds(ids).stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));
    }

    private LineaOrdenBajaResponse toLineaResponse(LineaOrdenBaja lb) {
        var lo      = lb.getLineaOrden();
        var art     = lo.getArticulo();
        var tipoMat = art.getTipoMaterial();
        var marca   = art.getBrand();
        var modelo  = art.getModelo();
        var almacen = art.getAlmacen();
        return new LineaOrdenBajaResponse(
                lo.getId(), art.getId(), art.getSerialNumber(),
                tipoMat != null ? tipoMat.getId()          : null,
                tipoMat != null ? tipoMat.getName()        : null,
                marca   != null ? marca.getId()            : null,
                marca   != null ? marca.getName()          : null,
                modelo  != null ? modelo.getId()           : null,
                modelo  != null ? modelo.getDescription()  : null,
                almacen != null ? almacen.getId()          : null,
                almacen != null ? almacen.getName()        : null);
    }
}
