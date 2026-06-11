package com.data4n6.inventory.orden.service;

import com.data4n6.catalog.Agent;
import com.data4n6.catalog.AgentRepository;
import com.data4n6.catalog.Unit;
import com.data4n6.catalog.UnitRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.data4n6.cases.Case;
import com.data4n6.data4n6.cases.CaseRepository;
import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.articulo.repository.ArticuloRepository;
import com.data4n6.inventory.estadoorden.repository.EstadoOrdenRepository;
import com.data4n6.inventory.evento.repository.EventoRepository;
import com.data4n6.inventory.eventohistorial.EventoHistorial;
import com.data4n6.inventory.eventohistorial.repository.EventoHistorialRepository;
import com.data4n6.inventory.orden.LineaOrden;
import com.data4n6.inventory.orden.LineaOrdenPrestamo;
import com.data4n6.inventory.orden.Orden;
import com.data4n6.inventory.orden.OrdenPrestamo;
import com.data4n6.inventory.orden.LineaOrdenDevolucion;
import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoDetalleResponse;
import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoResponse;
import com.data4n6.inventory.orden.dto.OrdenPrestamoRequest;
import com.data4n6.inventory.orden.dto.OrdenPrestamoResponse;
import com.data4n6.inventory.orden.OrdenDevolucion;
import com.data4n6.inventory.orden.repository.LineaOrdenDevolucionRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenPrestamoRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenRepository;
import com.data4n6.inventory.orden.repository.OrdenDevolucionRepository;
import com.data4n6.inventory.orden.repository.OrdenPrestamoRepository;
import com.data4n6.inventory.orden.repository.OrdenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdenPrestamoService {

    private final OrdenPrestamoRepository         repository;
    private final OrdenRepository                 ordenRepository;
    private final LineaOrdenRepository            lineaOrdenRepository;
    private final LineaOrdenPrestamoRepository    lineaPrestamoRepository;
    private final LineaOrdenDevolucionRepository  lineaDevolucionRepository;
    private final OrdenDevolucionRepository       ordenDevolucionRepository;
    private final EventoHistorialRepository       eventoHistorialRepository;
    private final ArticuloRepository              articuloRepository;
    private final EventoRepository                eventoRepository;
    private final EstadoOrdenRepository           estadoOrdenRepository;
    private final OrdenContadorService            ordenContadorService;
    @Qualifier("commonAgentRepository")
    private final AgentRepository                 agentRepository;
    @Qualifier("commonUnitRepository")
    private final UnitRepository                  unitRepository;
    private final CaseRepository                  caseRepository;

    private static final UUID EVENTO_PRESTAMO_ID =
            UUID.fromString("10000000-0000-0000-0000-000000000004");

    public List<OrdenPrestamoResponse> findAll() {
        var ordenes  = repository.findAllWithDetails();
        var ids      = ordenes.stream().map(op -> op.getOrden().getId()).toList();
        var counts   = countMap(ids);
        var devueltas = devueltasMap(ids);
        var agents   = agentMap(ordenes);
        var units    = unitMap(ordenes);
        var cases    = caseMap(ordenes);
        return ordenes.stream().map(op -> toResponse(op, counts, devueltas, agents, units, cases)).toList();
    }

    public OrdenPrestamoResponse findById(UUID id) {
        var op = repository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenPrestamo", id));
        var ids      = List.of(op.getOrden().getId());
        var counts   = countMap(ids);
        var devueltas = devueltasMap(ids);
        var agents   = agentMap(List.of(op));
        var units    = unitMap(List.of(op));
        var cases    = caseMap(List.of(op));
        return toResponse(op, counts, devueltas, agents, units, cases);
    }

    public List<LineaOrdenPrestamoResponse> findLineasByOrdenId(UUID ordenId) {
        return lineaPrestamoRepository.findByOrdenId(ordenId).stream()
                .map(this::toLineaResponse)
                .toList();
    }

    public List<LineaOrdenPrestamoDetalleResponse> findLineasDetalle(UUID ordenId) {
        var lineas = lineaPrestamoRepository.findByOrdenId(ordenId);

        var lineaOrdenIds = lineas.stream()
                .map(lp -> lp.getLineaOrden().getId())
                .collect(Collectors.toSet());

        Map<UUID, LineaOrdenDevolucion> devMap = lineaDevolucionRepository
                .findByLineaOrdenPrestamoIdIn(lineaOrdenIds)
                .stream()
                .collect(Collectors.toMap(
                        ld -> ld.getLineaOrdenPrestamo().getId(),
                        ld -> ld));

        // Load OrdenDevolucion entities to resolve agent/unit names
        var devOrdenIds = devMap.values().stream()
                .map(ld -> ld.getLineaOrden().getOrden().getId())
                .collect(Collectors.toSet());
        Map<UUID, OrdenDevolucion> ordenDevMap = devOrdenIds.isEmpty() ? Map.of() :
                ordenDevolucionRepository.findAllById(devOrdenIds)
                        .stream().collect(Collectors.toMap(OrdenDevolucion::getId, od -> od));

        var agentIds = ordenDevMap.values().stream()
                .map(OrdenDevolucion::getAgenteOrigenId).filter(Objects::nonNull).toList();
        var unitIds  = ordenDevMap.values().stream()
                .map(OrdenDevolucion::getUnidadOrigenId).filter(Objects::nonNull).toList();
        Map<UUID, Agent> agentMap = agentIds.isEmpty() ? Map.of() :
                agentRepository.findAllById(agentIds).stream()
                        .collect(Collectors.toMap(Agent::getId, a -> a));
        Map<UUID, Unit>  unitMap  = unitIds.isEmpty() ? Map.of() :
                unitRepository.findAllById(unitIds).stream()
                        .collect(Collectors.toMap(Unit::getId, u -> u));

        return lineas.stream()
                .map(lp -> {
                    var ld    = devMap.get(lp.getLineaOrden().getId());
                    boolean dev = ld != null;
                    String ref  = dev ? ld.getLineaOrden().getOrden().getNumeroReferencia() : null;
                    var fecha   = dev ? ld.getLineaOrden().getOrden().getAprobadoEn() : null;
                    String agenteNombre = null;
                    String unidadNombre = null;
                    UUID   devOrdenId   = null;
                    if (dev) {
                        var od = ordenDevMap.get(ld.getLineaOrden().getOrden().getId());
                        if (od != null) {
                            devOrdenId = od.getId();
                            if (od.getAgenteOrigenId() != null) {
                                var a = agentMap.get(od.getAgenteOrigenId());
                                if (a != null) agenteNombre = (a.getCallSign() + " " + a.getFirstName() + " " + a.getLastName()).trim();
                            }
                            if (od.getUnidadOrigenId() != null) {
                                var u = unitMap.get(od.getUnidadOrigenId());
                                if (u != null) unidadNombre = u.getName();
                            }
                        }
                    }
                    return toDetalleResponse(lp, dev, devOrdenId, ref, fecha, agenteNombre, unidadNombre);
                }).toList();
    }

    private LineaOrdenPrestamoDetalleResponse toDetalleResponse(
            LineaOrdenPrestamo lp, boolean devuelta, UUID ordenDevolucionId, String ordenDevRef,
            java.time.Instant fechaDev, String agenteDevNombre, String unidadDevNombre) {
        var lo  = lp.getLineaOrden();
        var art = lo.getArticulo();
        var tm  = art.getTipoMaterial();
        var br  = art.getBrand();
        var mo  = art.getModelo();
        var alm = art.getAlmacen();
        return new LineaOrdenPrestamoDetalleResponse(
                lp.getId(),
                art.getId(),
                art.getSerialNumber(),
                tm  != null ? tm.getId()          : null,
                tm  != null ? tm.getName()        : null,
                br  != null ? br.getId()          : null,
                br  != null ? br.getName()        : null,
                mo  != null ? mo.getId()          : null,
                mo  != null ? mo.getDescription() : null,
                alm != null ? alm.getId()         : null,
                alm != null ? alm.getName()       : null,
                devuelta,
                ordenDevolucionId,
                ordenDevRef,
                fechaDev,
                agenteDevNombre,
                unidadDevNombre);
    }

    @Transactional
    public OrdenPrestamoResponse create(OrdenPrestamoRequest request) {
        var evento = eventoRepository.findById(EVENTO_PRESTAMO_ID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Evento Préstamo not found"));
        var estadoPendiente = estadoOrdenRepository.findByNombreAndDeletedAtIsNull("Pendiente")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "EstadoOrden 'Pendiente' not found"));

        var orden = new Orden();
        orden.setTipoEvento(evento);
        orden.setEstadoOrden(estadoPendiente);
        orden.setNumeroReferencia(ordenContadorService.generateReference(evento));
        if (request.fechaInicio() != null)
            orden.setFechaInicio(request.fechaInicio().atStartOfDay(java.time.ZoneOffset.UTC).toInstant());
        ordenRepository.save(orden);

        if (request.agenteDestinoId() == null && request.unidadDestinoId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destino: se requiere agente o unidad");

        var op = new OrdenPrestamo();
        op.setOrden(orden);
        op.setAgenteOrigenId(request.agenteOrigenId());
        op.setUnidadOrigenId(request.unidadOrigenId());
        op.setAgenteDestinoId(request.agenteDestinoId());
        op.setUnidadDestinoId(request.unidadDestinoId());
        op.setFechaDevolucion(request.fechaDevolucion());
        op.setCasosId(request.casosId());
        repository.save(op);

        var descripcion = buildDescripcionEstado(request.agenteOrigenId(), request.unidadOrigenId(),
                                                 request.agenteDestinoId(), request.unidadDestinoId());

        for (UUID articuloId : request.articulosIds()) {
            Articulo art = articuloRepository.findActiveById(articuloId)
                    .orElseThrow(() -> new ResourceNotFoundException("Articulo", articuloId));

            var lo = new LineaOrden();
            lo.setOrden(orden);
            lo.setArticulo(art);
            lineaOrdenRepository.save(lo);

            String estadoPrevio = eventoHistorialRepository.findByArticulo(art.getId())
                    .stream().findFirst().map(EventoHistorial::getEstadoResultante).orElse(null);

            var lp = new LineaOrdenPrestamo();
            lp.setLineaOrden(lo);
            lp.setEstadoPrevio(estadoPrevio);
            lp.setAlmacenPrevioId(art.getAlmacen() != null ? art.getAlmacen().getId() : null);
            lineaPrestamoRepository.save(lp);

            var ev = new EventoHistorial();
            ev.setTipoEvento(evento);
            ev.setArticulo(art);
            ev.setLineaOrden(lo);
            ev.setEstadoResultante("Prestado");
            ev.setDescripcionEstado(descripcion);
            eventoHistorialRepository.save(ev);
        }

        return findById(op.getOrden().getId());
    }

    private String buildDescripcionEstado(UUID agenteOrigenId, UUID unidadOrigenId,
                                           UUID agenteDestinoId, UUID unidadDestinoId) {
        return buildParteDescripcion(agenteOrigenId, unidadOrigenId) + " → " +
               buildParteDescripcion(agenteDestinoId, unidadDestinoId);
    }

    private String buildParteDescripcion(UUID agenteId, UUID unidadId) {
        String unitName = null;
        if (unidadId != null) {
            Unit u = unitRepository.findById(unidadId).orElse(null);
            if (u != null) unitName = u.getName();
        }
        var sb = new StringBuilder();
        if (agenteId != null) {
            Agent a = agentRepository.findById(agenteId).orElse(null);
            if (a != null) {
                if (unitName == null && a.getUnit() != null) unitName = a.getUnit().getName();
                if (unitName != null) sb.append("Unidad ").append(unitName).append(' ');
                sb.append("Agente ").append(buildAgenteName(a));
                return sb.toString().trim();
            }
        }
        if (unitName != null) return "Unidad " + unitName;
        return "—";
    }

    private Map<UUID, Long> countMap(List<UUID> ids) {
        return lineaOrdenRepository.countByOrdenIds(ids).stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));
    }

    private Map<UUID, Long> devueltasMap(List<UUID> ids) {
        if (ids.isEmpty()) return Map.of();
        return lineaDevolucionRepository.countDevueltasByOrdenIds(ids).stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));
    }

    private Map<UUID, Agent> agentMap(List<OrdenPrestamo> ordenes) {
        var ids = ordenes.stream()
                .flatMap(op -> java.util.stream.Stream.of(op.getAgenteOrigenId(), op.getAgenteDestinoId()))
                .filter(Objects::nonNull)
                .distinct().toList();
        if (ids.isEmpty()) return Map.of();
        return agentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Agent::getId, a -> a));
    }

    private Map<UUID, Unit> unitMap(List<OrdenPrestamo> ordenes) {
        var ids = ordenes.stream()
                .flatMap(op -> java.util.stream.Stream.of(op.getUnidadOrigenId(), op.getUnidadDestinoId()))
                .filter(Objects::nonNull)
                .distinct().toList();
        if (ids.isEmpty()) return Map.of();
        return unitRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Unit::getId, u -> u));
    }

    private Map<UUID, Case> caseMap(List<OrdenPrestamo> ordenes) {
        var ids = ordenes.stream()
                .map(OrdenPrestamo::getCasosId)
                .filter(Objects::nonNull)
                .distinct().toList();
        if (ids.isEmpty()) return Map.of();
        return caseRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Case::getId, c -> c));
    }

    private OrdenPrestamoResponse toResponse(OrdenPrestamo op, Map<UUID, Long> counts,
                                              Map<UUID, Long> devueltas,
                                              Map<UUID, Agent> agents, Map<UUID, Unit> units,
                                              Map<UUID, Case> cases) {
        var orden  = op.getOrden();
        var estado = orden.getEstadoOrden();

        var agenteOrigen  = op.getAgenteOrigenId()  != null ? agents.get(op.getAgenteOrigenId())  : null;
        var unidadOrigen  = op.getUnidadOrigenId()  != null ? units.get(op.getUnidadOrigenId())  : null;
        var agenteDestino = op.getAgenteDestinoId() != null ? agents.get(op.getAgenteDestinoId()) : null;
        var unidadDestino = op.getUnidadDestinoId() != null ? units.get(op.getUnidadDestinoId()) : null;
        var caso          = op.getCasosId()         != null ? cases.get(op.getCasosId())          : null;

        return new OrdenPrestamoResponse(
                op.getId(),
                orden.getNumeroReferencia(),
                orden.getAprobadoPor(),
                orden.getAprobadoEn(),
                orden.getFechaInicio(),
                orden.getFechaFin(),
                op.getAgenteOrigenId(),  agenteOrigen  != null ? buildAgenteName(agenteOrigen)  : null,
                op.getUnidadOrigenId(),  unidadOrigen  != null ? unidadOrigen.getName()          : null,
                op.getAgenteDestinoId(), agenteDestino != null ? buildAgenteName(agenteDestino) : null,
                op.getUnidadDestinoId(), unidadDestino != null ? unidadDestino.getName()         : null,
                op.getFechaDevolucion(),
                estado != null ? estado.getId()      : null,
                estado != null ? estado.getNombre()  : null,
                op.getCasosId(),
                caso != null ? caso.getReference() : null,
                caso != null ? caso.getTitle()     : null,
                counts.getOrDefault(orden.getId(), 0L),
                devueltas.getOrDefault(orden.getId(), 0L));
    }

    private String buildAgenteName(Agent a) {
        var sb = new StringBuilder();
        if (a.getCallSign() != null && !a.getCallSign().isBlank())
            sb.append(a.getCallSign()).append(' ');
        sb.append(a.getFirstName());
        if (a.getLastName() != null) sb.append(' ').append(a.getLastName());
        return sb.toString().trim();
    }

    private LineaOrdenPrestamoResponse toLineaResponse(LineaOrdenPrestamo lp) {
        var lo          = lp.getLineaOrden();
        var art         = lo.getArticulo();
        var tipoMat     = art.getTipoMaterial();
        var marca       = art.getBrand();
        var modelo      = art.getModelo();
        var almacen     = art.getAlmacen();
        return new LineaOrdenPrestamoResponse(
                lo.getId(),
                art.getId(),
                art.getSerialNumber(),
                tipoMat  != null ? tipoMat.getId()             : null,
                tipoMat  != null ? tipoMat.getName()           : null,
                marca    != null ? marca.getId()               : null,
                marca    != null ? marca.getName()             : null,
                modelo   != null ? modelo.getId()              : null,
                modelo   != null ? modelo.getDescription()     : null,
                almacen  != null ? almacen.getId()             : null,
                almacen  != null ? almacen.getName()           : null
        );
    }
}
