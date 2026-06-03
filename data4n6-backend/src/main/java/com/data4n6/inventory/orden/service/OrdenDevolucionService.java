package com.data4n6.inventory.orden.service;

import com.data4n6.catalog.Agent;
import com.data4n6.catalog.AgentRepository;
import com.data4n6.catalog.Unit;
import com.data4n6.catalog.UnitRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.estadoorden.repository.EstadoOrdenRepository;
import com.data4n6.inventory.evento.repository.EventoRepository;
import com.data4n6.inventory.eventohistorial.EventoHistorial;
import com.data4n6.inventory.eventohistorial.repository.EventoHistorialRepository;
import com.data4n6.inventory.orden.*;
import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoResponse;
import com.data4n6.inventory.orden.dto.OrdenDevolucionLibreRequest;
import com.data4n6.inventory.orden.dto.OrdenDevolucionListResponse;
import com.data4n6.inventory.orden.dto.OrdenDevolucionRequest;
import com.data4n6.inventory.orden.dto.OrdenDevolucionResponse;
import com.data4n6.inventory.orden.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdenDevolucionService {

    private static final UUID EVENTO_DEVOLUCION_PRESTAMO_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000007");

    private final OrdenPrestamoRepository        prestamoRepository;
    private final OrdenDevolucionRepository      devolucionRepository;
    private final OrdenRepository                ordenRepository;
    private final LineaOrdenRepository           lineaOrdenRepository;
    private final LineaOrdenPrestamoRepository   lineaPrestamoRepository;
    private final LineaOrdenDevolucionRepository lineaDevolucionRepository;
    private final EventoRepository               eventoRepository;
    private final EstadoOrdenRepository          estadoOrdenRepository;
    private final OrdenContadorService           ordenContadorService;
    private final EventoHistorialRepository      eventoHistorialRepository;
    @Qualifier("commonAgentRepository")
    private final AgentRepository                agentRepository;
    @Qualifier("commonUnitRepository")
    private final UnitRepository                 unitRepository;

    public List<OrdenDevolucionListResponse> findAll() {
        var devoluciones = devolucionRepository.findAllWithDetails();
        if (devoluciones.isEmpty()) return List.of();

        var devOrdenIds = devoluciones.stream().map(od -> od.getOrden().getId()).toList();
        var countMap = lineaDevolucionRepository.countByDevolucionOrdenIds(devOrdenIds)
                .stream().collect(Collectors.toMap(r -> (UUID) r[0], r -> ((Number) r[1]).intValue()));

        var prestamoOrdenIds = devoluciones.stream()
                .map(od -> od.getOrdenPrestamo().getId()).distinct().toList();
        var prestamoMap = prestamoRepository.findAllById(prestamoOrdenIds)
                .stream().collect(Collectors.toMap(OrdenPrestamo::getId, op -> op));

        var agentIds = prestamoMap.values().stream()
                .map(OrdenPrestamo::getAgenteDestinoId).filter(Objects::nonNull).toList();
        var unitIds  = prestamoMap.values().stream()
                .map(OrdenPrestamo::getUnidadDestinoId).filter(Objects::nonNull).toList();

        Map<UUID, Agent> agents = agentIds.isEmpty() ? Map.of() :
                agentRepository.findAllById(agentIds).stream().collect(Collectors.toMap(Agent::getId, a -> a));
        Map<UUID, Unit>  units  = unitIds.isEmpty() ? Map.of() :
                unitRepository.findAllById(unitIds).stream().collect(Collectors.toMap(Unit::getId, u -> u));

        return devoluciones.stream().map(od -> {
            var op = prestamoMap.get(od.getOrdenPrestamo().getId());
            String agenteNombre = null;
            String unidadNombre = null;
            if (op != null) {
                if (op.getAgenteDestinoId() != null) {
                    var a = agents.get(op.getAgenteDestinoId());
                    if (a != null) agenteNombre = (a.getCallSign() + " " + a.getFirstName() + " " + a.getLastName()).trim();
                }
                if (op.getUnidadDestinoId() != null) {
                    var u = units.get(op.getUnidadDestinoId());
                    if (u != null) unidadNombre = u.getName();
                }
            }
            return new OrdenDevolucionListResponse(
                    od.getId(),
                    od.getOrden().getNumeroReferencia(),
                    od.getOrden().getAprobadoEn(),
                    od.getOrdenPrestamo().getNumeroReferencia(),
                    agenteNombre,
                    unidadNombre,
                    countMap.getOrDefault(od.getOrden().getId(), 0));
        }).toList();
    }

    public List<LineaOrdenPrestamoResponse> findPendientes(UUID ordenPrestamoId) {
        return lineaPrestamoRepository.findPendientesByOrdenId(ordenPrestamoId)
                .stream().map(this::toLineaResponse).toList();
    }

    @Transactional
    public OrdenDevolucionResponse create(OrdenDevolucionRequest request) {
        var prestamo = prestamoRepository.findByIdWithDetails(request.ordenPrestamoId())
                .orElseThrow(() -> new ResourceNotFoundException("OrdenPrestamo", request.ordenPrestamoId()));

        var evento = eventoRepository.findById(EVENTO_DEVOLUCION_PRESTAMO_ID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Evento Devolución Préstamo not found"));
        var estadoCompletada = estadoOrdenRepository.findByNombreAndDeletedAtIsNull("Completada")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "EstadoOrden 'Completada' not found"));

        var orden = new Orden();
        orden.setTipoEvento(evento);
        orden.setEstadoOrden(estadoCompletada);
        orden.setNumeroReferencia(ordenContadorService.generateReference(evento));
        orden.setFechaInicio(Instant.now());
        ordenRepository.save(orden);

        var od = new OrdenDevolucion();
        od.setOrden(orden);
        od.setOrdenPrestamo(prestamo.getOrden());
        devolucionRepository.save(od);

        String descBase = "Devolución préstamo " + prestamo.getOrden().getNumeroReferencia();

        for (UUID lineaPrestamoId : request.lineaPrestamoIds()) {
            var lp = lineaPrestamoRepository.findById(lineaPrestamoId)
                    .orElseThrow(() -> new ResourceNotFoundException("LineaOrdenPrestamo", lineaPrestamoId));

            var art = lp.getLineaOrden().getArticulo();

            var lo = new LineaOrden();
            lo.setOrden(orden);
            lo.setArticulo(art);
            lineaOrdenRepository.save(lo);

            var ld = new LineaOrdenDevolucion();
            ld.setLineaOrden(lo);
            ld.setLineaOrdenPrestamo(lp.getLineaOrden());
            lineaDevolucionRepository.save(ld);

            var ev = new EventoHistorial();
            ev.setTipoEvento(evento);
            ev.setArticulo(art);
            ev.setLineaOrden(lo);
            ev.setEstadoResultante("Almacén");
            ev.setDescripcionEstado(descBase);
            eventoHistorialRepository.save(ev);
        }

        long totalLineas    = lineaPrestamoRepository.countByOrdenId(request.ordenPrestamoId());
        long totalDevueltas = lineaDevolucionRepository.countByOrdenPrestamoId(request.ordenPrestamoId());
        boolean completado  = totalDevueltas >= totalLineas;

        if (completado) {
            prestamo.getOrden().setEstadoOrden(estadoCompletada);
            ordenRepository.save(prestamo.getOrden());
        }

        return new OrdenDevolucionResponse(
                od.getId(),
                orden.getNumeroReferencia(),
                request.ordenPrestamoId(),
                prestamo.getOrden().getNumeroReferencia(),
                request.lineaPrestamoIds().size(),
                completado);
    }

    @Transactional
    public List<OrdenDevolucionResponse> createFromArticulos(OrdenDevolucionLibreRequest request) {
        var lineasPendientes = lineaPrestamoRepository.findPendientesByArticuloIds(request.articuloIds());
        if (lineasPendientes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "None of the selected articles have a pending loan");
        }

        var evento = eventoRepository.findById(EVENTO_DEVOLUCION_PRESTAMO_ID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Evento Devolución Préstamo not found"));
        var estadoCompletada = estadoOrdenRepository.findByNombreAndDeletedAtIsNull("Completada")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "EstadoOrden 'Completada' not found"));

        // Group pending lines by their loan Orden
        var byLoan = lineasPendientes.stream()
                .collect(Collectors.groupingBy(lp -> lp.getLineaOrden().getOrden().getId()));

        List<OrdenDevolucionResponse> results = new ArrayList<>();

        for (var entry : byLoan.entrySet()) {
            UUID prestamoOrdenId = entry.getKey();
            var lineas = entry.getValue();

            var prestamoOrden = ordenRepository.findById(prestamoOrdenId)
                    .orElseThrow(() -> new ResourceNotFoundException("Orden", prestamoOrdenId));

            var orden = new Orden();
            orden.setTipoEvento(evento);
            orden.setEstadoOrden(estadoCompletada);
            orden.setNumeroReferencia(ordenContadorService.generateReference(evento));
            orden.setFechaInicio(Instant.now());
            ordenRepository.save(orden);

            var od = new OrdenDevolucion();
            od.setOrden(orden);
            od.setOrdenPrestamo(prestamoOrden);
            devolucionRepository.save(od);

            String descBase = "Devolución préstamo " + prestamoOrden.getNumeroReferencia();

            for (var lp : lineas) {
                var art = lp.getLineaOrden().getArticulo();

                var lo = new LineaOrden();
                lo.setOrden(orden);
                lo.setArticulo(art);
                lineaOrdenRepository.save(lo);

                var ld = new LineaOrdenDevolucion();
                ld.setLineaOrden(lo);
                ld.setLineaOrdenPrestamo(lp.getLineaOrden());
                lineaDevolucionRepository.save(ld);

                var ev = new EventoHistorial();
                ev.setTipoEvento(evento);
                ev.setArticulo(art);
                ev.setLineaOrden(lo);
                ev.setEstadoResultante("Almacén");
                ev.setDescripcionEstado(descBase);
                eventoHistorialRepository.save(ev);
            }

            long totalLineas    = lineaPrestamoRepository.countByOrdenId(prestamoOrdenId);
            long totalDevueltas = lineaDevolucionRepository.countByOrdenPrestamoId(prestamoOrdenId);
            boolean completado  = totalDevueltas >= totalLineas;

            if (completado) {
                prestamoOrden.setEstadoOrden(estadoCompletada);
                ordenRepository.save(prestamoOrden);
            }

            results.add(new OrdenDevolucionResponse(
                    od.getId(),
                    orden.getNumeroReferencia(),
                    prestamoOrdenId,
                    prestamoOrden.getNumeroReferencia(),
                    lineas.size(),
                    completado));
        }

        return results;
    }

    private LineaOrdenPrestamoResponse toLineaResponse(LineaOrdenPrestamo lp) {
        var lo  = lp.getLineaOrden();
        var art = lo.getArticulo();
        var tm  = art.getTipoMaterial();
        var br  = art.getBrand();
        var mo  = art.getModelo();
        var alm = art.getAlmacen();
        return new LineaOrdenPrestamoResponse(
                lp.getId(),
                art.getId(),
                art.getSerialNumber(),
                tm  != null ? tm.getId()           : null,
                tm  != null ? tm.getName()         : null,
                br  != null ? br.getId()           : null,
                br  != null ? br.getName()         : null,
                mo  != null ? mo.getId()           : null,
                mo  != null ? mo.getDescription()  : null,
                alm != null ? alm.getId()          : null,
                alm != null ? alm.getName()        : null);
    }
}
