package com.data4n6.inventory.propuesta.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.almacen.repository.AlmacenRepository;
import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.articulo.repository.ArticuloRepository;
import com.data4n6.inventory.categoriarticulo.repository.CategoriaArticuloRepository;
import com.data4n6.inventory.evento.Evento;
import com.data4n6.inventory.evento.repository.EventoRepository;
import com.data4n6.inventory.eventohistorial.EventoHistorial;
import com.data4n6.inventory.eventohistorial.repository.EventoHistorialRepository;
import com.data4n6.inventory.materialactivo.MaterialActivo;
import com.data4n6.inventory.materialactivo.repository.MaterialActivoRepository;
import com.data4n6.inventory.materialreservado.repository.MaterialReservadoRepository;
import com.data4n6.inventory.modelo.repository.ModeloRepository;
import com.data4n6.inventory.estadoorden.EstadoOrden;
import com.data4n6.inventory.estadoorden.repository.EstadoOrdenRepository;
import com.data4n6.inventory.orden.LineaOrden;
import com.data4n6.inventory.orden.LineaOrdenAdjudicacion;
import com.data4n6.inventory.orden.LineaOrdenBaja;
import com.data4n6.inventory.orden.LineaOrdenPrestamo;
import com.data4n6.inventory.orden.LineaOrdenTraspaso;
import com.data4n6.inventory.orden.Orden;
import com.data4n6.inventory.orden.service.OrdenContadorService;
import com.data4n6.inventory.orden.OrdenAdjudicacion;
import com.data4n6.inventory.orden.OrdenPrestamo;
import com.data4n6.inventory.orden.OrdenTraspaso;
import com.data4n6.inventory.orden.repository.LineaOrdenAdjudicacionRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenBajaRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenPrestamoRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenTraspasoRepository;
import com.data4n6.inventory.orden.repository.OrdenAdjudicacionRepository;
import com.data4n6.inventory.orden.repository.OrdenPrestamoRepository;
import com.data4n6.inventory.orden.repository.OrdenRepository;
import com.data4n6.inventory.orden.repository.OrdenTraspasoRepository;
import com.data4n6.inventory.propuesta.LineaPropuesta;
import com.data4n6.inventory.propuesta.Propuesta;
import com.data4n6.inventory.propuesta.PropuestaContador;
import com.data4n6.inventory.propuesta.PropuestaContadorId;
import com.data4n6.inventory.propuesta.dto.AprobarRequest;
import com.data4n6.inventory.propuesta.dto.LineaPropuestaRequest;
import com.data4n6.inventory.propuesta.dto.LineaPropuestaResponse;
import com.data4n6.inventory.propuesta.dto.PropuestaRequest;
import com.data4n6.inventory.propuesta.dto.PropuestaResponse;
import com.data4n6.inventory.propuesta.repository.LineaPropuestaRepository;
import com.data4n6.inventory.propuesta.repository.PropuestaContadorRepository;
import com.data4n6.inventory.propuesta.repository.PropuestaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropuestaService {

    private final PropuestaRepository repository;
    private final PropuestaContadorRepository contadorRepository;
    private final LineaPropuestaRepository lineaRepository;
    private final EventoRepository eventoRepository;
    private final ArticuloRepository articuloRepository;
    private final CategoriaArticuloRepository categoriaRepository;
    private final ModeloRepository modeloRepository;
    private final AlmacenRepository almacenRepository;
    private final EventoHistorialRepository historialRepository;
    private final MaterialActivoRepository materialActivoRepository;
    private final MaterialReservadoRepository materialReservadoRepository;
    private final OrdenRepository ordenRepository;
    private final OrdenTraspasoRepository ordenTraspasoRepository;
    private final OrdenAdjudicacionRepository ordenAdjudicacionRepository;
    private final OrdenPrestamoRepository ordenPrestamoRepository;
    private final LineaOrdenRepository lineaOrdenRepository;
    private final LineaOrdenTraspasoRepository lineaOrdenTraspasoRepository;
    private final LineaOrdenAdjudicacionRepository lineaOrdenAdjudicacionRepository;
    private final LineaOrdenPrestamoRepository lineaOrdenPrestamoRepository;
    private final LineaOrdenBajaRepository lineaOrdenBajaRepository;
    private final EstadoOrdenRepository estadoOrdenRepository;
    private final OrdenContadorService ordenContadorService;

    public List<PropuestaResponse> findAll() {
        return repository.findAllActive().stream().map(this::toResponse).toList();
    }

    public List<PropuestaResponse> findByEvento(UUID eventoId) {
        return repository.findActiveByEvento(eventoId).stream().map(this::toResponse).toList();
    }

    public PropuestaResponse findById(UUID id) {
        return repository.findByIdWithEvento(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", id));
    }

    public List<LineaPropuestaResponse> findLineas(UUID propuestaId) {
        if (!repository.existsById(propuestaId)) {
            throw new ResourceNotFoundException("Propuesta", propuestaId);
        }
        return lineaRepository.findByPropuesta(propuestaId).stream().map(this::toLineaResponse).toList();
    }

    @Transactional
    public PropuestaResponse create(PropuestaRequest request) {
        Evento evento = eventoRepository.findById(request.eventoId())
                .filter(Evento::isPermitePropuesta)
                .orElseThrow(() -> new ResourceNotFoundException("Evento (permite_propuesta)", request.eventoId()));

        Propuesta propuesta = new Propuesta();
        propuesta.setEvento(evento);
        propuesta.setNumeroReferencia(generateReference(evento));
        propuesta.setRealizadoPor(request.realizadoPor());
        propuesta.setCasosId(request.casosId());
        propuesta.setNotas(request.notas());
        repository.save(propuesta);
        return toResponse(propuesta);
    }

    @Transactional
    public PropuestaResponse update(UUID id, PropuestaRequest request) {
        Propuesta propuesta = repository.findByIdWithEvento(id)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", id));
        guardBorrador(propuesta);

        propuesta.setRealizadoPor(request.realizadoPor());
        propuesta.setCasosId(request.casosId());
        propuesta.setNotas(request.notas());
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);
        return toResponse(propuesta);
    }

    @Transactional
    public void delete(UUID id) {
        Propuesta propuesta = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", id));
        guardBorrador(propuesta);
        propuesta.softDelete();
        repository.save(propuesta);
    }

    // ── Lines ─────────────────────────────────────────────────────────────────

    @Transactional
    public LineaPropuestaResponse addLinea(UUID propuestaId, LineaPropuestaRequest request) {
        Propuesta propuesta = repository.findByIdWithEvento(propuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", propuestaId));
        guardBorrador(propuesta);

        LineaPropuesta linea = new LineaPropuesta();
        linea.setPropuesta(propuesta);
        applyLinea(linea, request);
        lineaRepository.save(linea);
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);
        return toLineaResponse(linea);
    }

    @Transactional
    public LineaPropuestaResponse updateLinea(UUID propuestaId, UUID lineaId, LineaPropuestaRequest request) {
        Propuesta propuesta = repository.findByIdWithEvento(propuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", propuestaId));
        guardBorrador(propuesta);

        LineaPropuesta linea = lineaRepository.findById(lineaId)
                .orElseThrow(() -> new ResourceNotFoundException("LineaPropuesta", lineaId));
        applyLinea(linea, request);
        lineaRepository.save(linea);
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);
        return toLineaResponse(linea);
    }

    @Transactional
    public void deleteLinea(UUID propuestaId, UUID lineaId) {
        Propuesta propuesta = repository.findByIdWithEvento(propuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", propuestaId));
        guardBorrador(propuesta);

        LineaPropuesta linea = lineaRepository.findById(lineaId)
                .orElseThrow(() -> new ResourceNotFoundException("LineaPropuesta", lineaId));
        lineaRepository.delete(linea);
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);
    }

    // ── State transitions ──────────────────────────────────────────────────────

    @Transactional
    public PropuestaResponse enviar(UUID id) {
        Propuesta propuesta = repository.findByIdWithEvento(id)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", id));
        guardEstado(propuesta, "borrador");
        propuesta.setEstado("enviada");
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);
        return toResponse(propuesta);
    }

    @Transactional
    public PropuestaResponse rechazar(UUID id, String notas) {
        Propuesta propuesta = repository.findByIdWithEvento(id)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", id));
        guardEstado(propuesta, "enviada");
        propuesta.setEstado("rechazada");
        if (notas != null) propuesta.setNotas(notas);
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);
        return toResponse(propuesta);
    }

    @Transactional
    public PropuestaResponse aprobar(UUID id, AprobarRequest req) {
        Propuesta propuesta = repository.findByIdWithEvento(id)
                .orElseThrow(() -> new ResourceNotFoundException("Propuesta", id));
        guardEstado(propuesta, "enviada");

        List<LineaPropuesta> lineas = lineaRepository.findByPropuesta(id);
        if (lineas.isEmpty()) {
            throw new IllegalArgumentException("La propuesta no tiene líneas");
        }

        materialReservadoRepository.deleteExpired(Instant.now());

        String prefijo = propuesta.getEvento().getPrefijoReferencia();

        Orden orden = crearOrden(propuesta, req, prefijo);

        for (LineaPropuesta linea : lineas) {
            procesarLinea(propuesta, linea, prefijo, orden);
        }

        propuesta.setEstado("aprobada");
        propuesta.setUpdatedAt(Instant.now());
        repository.save(propuesta);

        return toResponse(propuesta);
    }

    private Orden crearOrden(Propuesta propuesta, AprobarRequest req, String prefijo) {
        EstadoOrden estadoPendiente = estadoOrdenRepository.findByNombreAndDeletedAtIsNull("Pendiente")
                .orElseThrow(() -> new IllegalStateException("Estado 'Pendiente' no encontrado en t200_estados_ordenes"));

        Orden orden = new Orden();
        orden.setTipoEvento(propuesta.getEvento());
        orden.setEstadoOrden(estadoPendiente);
        orden.setNumeroReferencia(ordenContadorService.generateReference(propuesta.getEvento()));
        orden.setAprobadoPor(req.aprobadoPor());
        ordenRepository.save(orden);

        switch (prefijo) {
            case "TRS" -> {
                OrdenTraspaso ext = new OrdenTraspaso();
                ext.setOrden(orden);
                ordenTraspasoRepository.save(ext);
            }
            case "ADJ" -> {
                if (req.adjudicatarioId() == null || req.adjudicatarioTabla() == null) {
                    throw new IllegalArgumentException("Las órdenes de Adjudicación requieren adjudicatarioId y adjudicatarioTabla");
                }
                OrdenAdjudicacion ext = new OrdenAdjudicacion();
                ext.setOrden(orden);
                ext.setAdjudicatarioId(req.adjudicatarioId());
                ext.setAdjudicatarioTabla(req.adjudicatarioTabla());
                ordenAdjudicacionRepository.save(ext);
            }
            case "PRS" -> {
                if (req.adjudicatarioId() == null || req.adjudicatarioTabla() == null) {
                    throw new IllegalArgumentException("Las órdenes de Préstamo requieren adjudicatarioId y adjudicatarioTabla");
                }
                OrdenPrestamo ext = new OrdenPrestamo();
                ext.setOrden(orden);
                if ("t100_agentes".equals(req.adjudicatarioTabla())) {
                    ext.setAgenteDestinoId(req.adjudicatarioId());
                } else {
                    ext.setUnidadDestinoId(req.adjudicatarioId());
                }
                ext.setFechaDevolucion(req.fechaDevolucion());
                ordenPrestamoRepository.save(ext);
            }
            case "BAJ" -> {
                // TODO: create t600_ordenes_baja subtable when migration is added
            }
        }

        return orden;
    }

    // ── Reference generation (pessimistic lock) ────────────────────────────────

    private String generateReference(Evento evento) {
        short anio = (short) LocalDate.now().getYear();
        PropuestaContadorId pk = new PropuestaContadorId();
        pk.setEventoId(evento.getId());
        pk.setAnio(anio);

        PropuestaContador contador = contadorRepository.findForUpdate(evento.getId(), anio)
                .orElseGet(() -> {
                    PropuestaContador c = new PropuestaContador();
                    c.setId(pk);
                    c.setEvento(evento);
                    c.setUltimoNumero(0);
                    return c;
                });

        int siguiente = contador.getUltimoNumero() + 1;
        contador.setUltimoNumero(siguiente);
        contadorRepository.save(contador);

        return String.format("%s-%d-%05d", evento.getPrefijoReferencia(), anio, siguiente);
    }


    // ── Line processing on approval ────────────────────────────────────────────

    private void procesarLinea(Propuesta propuesta, LineaPropuesta linea, String prefijo, Orden orden) {
        switch (prefijo) {
            case "TRS" -> procesarTraspaso(propuesta, linea, orden);
            case "ADJ" -> procesarAdjudicacion(propuesta, linea, orden);
            case "PRS" -> procesarPrestamo(propuesta, linea, orden);
            case "BAJ" -> procesarBaja(propuesta, linea, orden);
            // TODO: ENT — entrada de almacén crea artículos nuevos; requiere lógica propia (LineaOrdenEntrada)
            default -> throw new IllegalArgumentException("Prefijo de propuesta desconocido: " + prefijo);
        }
    }

    private void procesarTraspaso(Propuesta propuesta, LineaPropuesta linea, Orden orden) {
        Articulo articulo = linea.getArticulo();
        MaterialActivo activo = materialActivoRepository.findByArticulo(articulo.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Artículo sin registro activo: " + articulo.getId()));

        if (articulo.getAlmacen() == null) {
            throw new IllegalArgumentException("El artículo no tiene almacén de origen asignado: " + articulo.getId());
        }

        LineaOrden lineaOrden = saveLineaOrden(orden, articulo);

        LineaOrdenTraspaso ext = new LineaOrdenTraspaso();
        ext.setLineaOrden(lineaOrden);
        ext.setAlmacenOrigen(articulo.getAlmacen());
        ext.setAlmacenDestino(linea.getAlmacen());
        lineaOrdenTraspasoRepository.save(ext);

        EventoHistorial evento = buildEvento(propuesta.getEvento(), articulo, lineaOrden);
        historialRepository.save(evento);

        activo.setAlmacen(linea.getAlmacen());
        activo.setUltimoEvento(evento);
        activo.setUpdatedAt(Instant.now());
        materialActivoRepository.save(activo);

        articulo.setAlmacen(linea.getAlmacen());
        articuloRepository.save(articulo);
    }

    private void procesarAdjudicacion(Propuesta propuesta, LineaPropuesta linea, Orden orden) {
        Articulo articulo = linea.getArticulo();
        MaterialActivo activo = materialActivoRepository.findByArticulo(articulo.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Artículo sin registro activo: " + articulo.getId()));

        LineaOrden lineaOrden = saveLineaOrden(orden, articulo);

        LineaOrdenAdjudicacion ext = new LineaOrdenAdjudicacion();
        ext.setLineaOrden(lineaOrden);
        lineaOrdenAdjudicacionRepository.save(ext);

        EventoHistorial evento = buildEvento(propuesta.getEvento(), articulo, lineaOrden);
        historialRepository.save(evento);

        activo.setAdjudicatarioId(linea.getAdjudicatarioId());
        activo.setAdjudicatarioTabla(linea.getAdjudicatarioTabla());
        activo.setUltimoEvento(evento);
        activo.setUpdatedAt(Instant.now());
        materialActivoRepository.save(activo);
    }

    private void procesarPrestamo(Propuesta propuesta, LineaPropuesta linea, Orden orden) {
        Articulo articulo = linea.getArticulo();
        MaterialActivo activo = materialActivoRepository.findByArticulo(articulo.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Artículo sin registro activo: " + articulo.getId()));

        LineaOrden lineaOrden = saveLineaOrden(orden, articulo);

        LineaOrdenPrestamo ext = new LineaOrdenPrestamo();
        ext.setLineaOrden(lineaOrden);
        lineaOrdenPrestamoRepository.save(ext);

        EventoHistorial evento = buildEvento(propuesta.getEvento(), articulo, lineaOrden);
        historialRepository.save(evento);

        activo.setAdjudicatarioId(linea.getAdjudicatarioId());
        activo.setAdjudicatarioTabla(linea.getAdjudicatarioTabla());
        activo.setUltimoEvento(evento);
        activo.setUpdatedAt(Instant.now());
        materialActivoRepository.save(activo);
    }

    private void procesarBaja(Propuesta propuesta, LineaPropuesta linea, Orden orden) {
        if (linea.getArticulo() == null) {
            throw new IllegalArgumentException("Las líneas de Baja requieren un artículo concreto");
        }
        Articulo articulo = linea.getArticulo();
        MaterialActivo activo = materialActivoRepository.findByArticulo(articulo.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Artículo sin registro activo: " + articulo.getId()));

        LineaOrden lineaOrden = saveLineaOrden(orden, articulo);

        LineaOrdenBaja ext = new LineaOrdenBaja();
        ext.setLineaOrden(lineaOrden);
        lineaOrdenBajaRepository.save(ext);

        EventoHistorial evento = buildEvento(propuesta.getEvento(), articulo, lineaOrden);
        historialRepository.save(evento);

        materialActivoRepository.delete(activo);
    }

    private EventoHistorial buildEvento(Evento tipoEvento, Articulo articulo, LineaOrden lineaOrden) {
        EventoHistorial ev = new EventoHistorial();
        ev.setTipoEvento(tipoEvento);
        ev.setArticulo(articulo);
        ev.setLineaOrden(lineaOrden);
        return ev;
    }

    private LineaOrden saveLineaOrden(Orden orden, Articulo articulo) {
        LineaOrden lo = new LineaOrden();
        lo.setOrden(orden);
        lo.setArticulo(articulo);
        return lineaOrdenRepository.save(lo);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void guardBorrador(Propuesta propuesta) {
        if (!"borrador".equals(propuesta.getEstado())) {
            throw new IllegalArgumentException(
                    "Solo se pueden modificar propuestas en estado 'borrador'. Estado actual: " + propuesta.getEstado());
        }
    }

    private void guardEstado(Propuesta propuesta, String esperado) {
        if (!esperado.equals(propuesta.getEstado())) {
            throw new IllegalArgumentException(
                    "La propuesta debe estar en estado '" + esperado + "'. Estado actual: " + propuesta.getEstado());
        }
    }

    private void applyLinea(LineaPropuesta linea, LineaPropuestaRequest req) {
        linea.setArticulo(req.articuloId() == null ? null :
                articuloRepository.findById(req.articuloId())
                        .orElseThrow(() -> new ResourceNotFoundException("Articulo", req.articuloId())));
        linea.setCategoria(req.categoriaId() == null ? null :
                categoriaRepository.findById(req.categoriaId())
                        .orElseThrow(() -> new ResourceNotFoundException("CategoriaArticulo", req.categoriaId())));
        linea.setModelo(req.modeloId() == null ? null :
                modeloRepository.findById(req.modeloId())
                        .orElseThrow(() -> new ResourceNotFoundException("Modelo", req.modeloId())));
        linea.setAlmacen(req.almacenId() == null ? null :
                almacenRepository.findById(req.almacenId())
                        .orElseThrow(() -> new ResourceNotFoundException("Almacen", req.almacenId())));
        linea.setNumeroSerie(req.numeroSerie());
        linea.setPrecio(req.precio());
        linea.setAdjudicatarioId(req.adjudicatarioId());
        linea.setAdjudicatarioTabla(req.adjudicatarioTabla());
        linea.setFechaDevolucion(req.fechaDevolucion());
        linea.setNotas(req.notas());
        linea.setOrden(req.orden());
    }

    private PropuestaResponse toResponse(Propuesta p) {
        Evento e = p.getEvento();
        return new PropuestaResponse(
                p.getId(), e.getId(), e.getNombre(), e.getPrefijoReferencia(),
                p.getNumeroReferencia(), p.getEstado(), p.getCasosId(),
                p.getRealizadoPor(), p.getNotas(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private LineaPropuestaResponse toLineaResponse(LineaPropuesta l) {
        return new LineaPropuestaResponse(
                l.getId(),
                l.getPropuesta().getId(),
                l.getArticulo() == null ? null : l.getArticulo().getId(),
                l.getCategoria() == null ? null : l.getCategoria().getId(),
                l.getCategoria() == null ? null : l.getCategoria().getName(),
                l.getModelo() == null ? null : l.getModelo().getId(),
                l.getModelo() == null ? null : l.getModelo().getDescription(),
                l.getAlmacen() == null ? null : l.getAlmacen().getId(),
                l.getAlmacen() == null ? null : l.getAlmacen().getName(),
                l.getNumeroSerie(),
                l.getPrecio(),
                l.getAdjudicatarioId(),
                l.getAdjudicatarioTabla(),
                l.getFechaDevolucion(),
                l.getNotas(),
                l.getOrden());
    }
}
