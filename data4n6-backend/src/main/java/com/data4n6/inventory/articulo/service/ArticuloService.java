package com.data4n6.inventory.articulo.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.articulo.Articulo;
import com.data4n6.inventory.articulo.dto.ArticuloMovimientoResponse;
import com.data4n6.inventory.articulo.dto.ArticuloRequest;
import com.data4n6.inventory.articulo.dto.ArticuloResponse;
import com.data4n6.inventory.articulo.repository.ArticuloRepository;
import com.data4n6.inventory.eventohistorial.repository.EventoHistorialRepository;
import com.data4n6.inventory.orden.Orden;
import com.data4n6.inventory.orden.repository.LineaOrdenRepository;
import com.data4n6.inventory.orden.repository.LineaOrdenDevolucionRepository;
import com.data4n6.inventory.marca.repository.T200MarcaRepository;
import com.data4n6.inventory.almacen.repository.AlmacenRepository;
import com.data4n6.inventory.modelo.repository.ModeloRepository;
import com.data4n6.inventory.tipomaterial.repository.TipoMaterialRepository;
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
public class ArticuloService {

    private static final String TABLE = "t100_articulos";

    private final ArticuloRepository           repository;
    private final TipoMaterialRepository       tipoMaterialRepository;
    private final T200MarcaRepository          brandRepository;
    private final AlmacenRepository            almacenRepository;
    private final ModeloRepository             modeloRepository;
    private final EventoHistorialRepository        eventoHistorialRepository;
    private final LineaOrdenRepository             lineaOrdenRepository;
    private final LineaOrdenDevolucionRepository   lineaOrdenDevolucionRepository;
    private final MetadataService                  metadataService;

    public List<ArticuloResponse> findAll() {
        var articulos = repository.findAllActive();
        var ids       = articulos.stream().map(Articulo::getId).toList();
        var infoMap   = buildInfoMap(ids);
        return articulos.stream().map(a -> toResponse(a, infoMap.get(a.getId()))).toList();
    }

    public ArticuloResponse findById(UUID id) {
        var a = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Articulo", id));
        var infoMap = buildInfoMap(List.of(id));
        return toResponse(a, infoMap.get(id));
    }

    @Transactional
    public ArticuloResponse create(ArticuloRequest request) {
        Articulo articulo = new Articulo();
        applyRequest(articulo, request);
        repository.save(articulo);
        metadataService.onCreate(articulo.getId(), TABLE);
        return toResponse(articulo, null);
    }

    @Transactional
    public void delete(UUID id) {
        Articulo articulo = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Articulo", id));
        articulo.softDelete();
        repository.save(articulo);
    }

    public List<ArticuloMovimientoResponse> findHistorial(UUID articuloId) {
        var eventos = eventoHistorialRepository.findByArticulo(articuloId);

        // Collect distinct orden IDs for batch queries
        List<UUID> ordenIds = eventos.stream()
                .map(ev -> ev.getLineaOrden() != null ? ev.getLineaOrden().getOrden().getId() : null)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        // Batch: total lineas per orden
        Map<UUID, Long> totalMap = lineaOrdenRepository.countByOrdenIds(ordenIds).stream()
                .collect(Collectors.toMap(r -> (UUID) r[0], r -> (Long) r[1]));

        // Batch: devueltas per prestamo orden
        Map<UUID, Long> devueltasMap = lineaOrdenDevolucionRepository.countDevueltasByOrdenIds(ordenIds).stream()
                .collect(Collectors.toMap(r -> (UUID) r[0], r -> (Long) r[1]));

        // Batch: for devolution events, map lineaOrden.id → loan orden.id
        List<UUID> devLineaIds = eventos.stream()
                .filter(ev -> ev.getLineaOrden() != null)
                .map(ev -> ev.getLineaOrden().getId())
                .toList();
        Map<UUID, UUID> lineaToPrestamoOrdenMap = devLineaIds.isEmpty()
                ? java.util.Collections.emptyMap()
                : lineaOrdenDevolucionRepository.findPrestamoOrdenIdsByLineaOrdenIds(devLineaIds).stream()
                        .collect(Collectors.toMap(r -> (UUID) r[0], r -> (UUID) r[1]));

        return eventos.stream().map(ev -> {
            var tipo = ev.getTipoEvento();
            var lo   = ev.getLineaOrden();
            var ord  = lo != null ? lo.getOrden() : null;

            String estadoOrden = null;
            String detalle     = null;

            if (ord != null) {
                estadoOrden = ord.getEstadoOrden() != null
                        ? ord.getEstadoOrden().getDescripcionCorta()
                        : null;

                long total     = totalMap.getOrDefault(ord.getId(), 0L);
                long devueltas = devueltasMap.getOrDefault(ord.getId(), 0L);

                if (total > 0) {
                    detalle = devueltasMap.containsKey(ord.getId())
                            ? devueltas + "/" + total
                            : null;
                }
            }

            String ordenCategoria = null;
            if (ord != null && ord.getTipoEvento() != null) {
                String nombre = ord.getTipoEvento().getNombre().toLowerCase();
                if      (nombre.contains("préstamo"))    ordenCategoria = "prestamo";
                else if (nombre.contains("entrada"))     ordenCategoria = "entrada";
                else if (nombre.contains("baja"))        ordenCategoria = "baja";
                else if (nombre.contains("traspaso"))    ordenCategoria = "traspaso";
                else if (nombre.contains("devolución"))  ordenCategoria = "devolucion";
                else if (nombre.contains("adjudicaci"))  ordenCategoria = "adjudicacion";
                else if (nombre.contains("reparaci"))    ordenCategoria = "reparacion";
            }

            UUID ordenPrestamoId = (lo != null && "devolucion".equals(ordenCategoria))
                    ? lineaToPrestamoOrdenMap.get(lo.getId())
                    : null;

            return new ArticuloMovimientoResponse(
                    ev.getId(),
                    ev.getCreatedAt(),
                    tipo.getNombre(),
                    ev.getEstadoResultante(),
                    ev.getDescripcionEstado(),
                    ord != null ? ord.getNumeroReferencia() : null,
                    estadoOrden,
                    detalle,
                    ord != null ? ord.getId() : null,
                    ordenCategoria,
                    ordenPrestamoId
            );
        }).toList();
    }

    private record ArticuloInfo(String estadoActual, String descripcionEstado, long numMovimientos, java.time.Instant ultimoMovimiento, UUID ultimaOrdenId, String ultimaOrdenReferencia, long numPrestamos, java.time.Instant fechaUltimoPrestamo) {}

    private Map<UUID, ArticuloInfo> buildInfoMap(List<UUID> ids) {
        var byArticulo = eventoHistorialRepository.findAllByArticuloIds(ids).stream()
                .collect(Collectors.groupingBy(ev -> ev.getArticulo().getId()));

        return byArticulo.entrySet().stream().collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> {
                    var eventos = entry.getValue(); // already ORDER BY createdAt DESC
                    var latest = eventos.get(0);
                    String estado = latest.getEstadoResultante() != null
                            ? latest.getEstadoResultante() : latest.getTipoEvento().getNombre();
                    Orden orden = latest.getLineaOrden() != null ? latest.getLineaOrden().getOrden() : null;
                    var prestamos = eventos.stream()
                            .filter(ev -> "Prestado".equals(ev.getEstadoResultante()))
                            .toList();
                    java.time.Instant fechaUltimoPrestamo = prestamos.isEmpty() ? null : prestamos.get(0).getCreatedAt();
                    return new ArticuloInfo(
                            estado,
                            latest.getDescripcionEstado(),
                            eventos.size(),
                            latest.getCreatedAt(),
                            orden != null ? orden.getId()               : null,
                            orden != null ? orden.getNumeroReferencia() : null,
                            prestamos.size(),
                            fechaUltimoPrestamo
                    );
                }
        ));
    }

    private ArticuloResponse toResponse(Articulo a, ArticuloInfo info) {
        var tipo    = a.getTipoMaterial();
        var marca   = a.getBrand();
        var almacen = a.getAlmacen();
        var modelo  = a.getModelo();
        return new ArticuloResponse(
                a.getId(),
                tipo    != null ? tipo.getId()            : null,
                tipo    != null ? tipo.getName()          : null,
                marca   != null ? marca.getId()           : null,
                marca   != null ? marca.getName()         : null,
                almacen != null ? almacen.getId()         : null,
                almacen != null ? almacen.getName()       : null,
                modelo  != null ? modelo.getId()          : null,
                modelo  != null ? modelo.getDescription() : null,
                a.getSerialNumber(),
                info != null ? info.estadoActual()          : null,
                info != null ? info.descripcionEstado()     : null,
                info != null ? info.numMovimientos()        : 0L,
                info != null ? info.ultimoMovimiento()      : null,
                info != null ? info.ultimaOrdenId()         : null,
                info != null ? info.ultimaOrdenReferencia() : null,
                info != null ? info.numPrestamos()          : 0L,
                info != null ? info.fechaUltimoPrestamo()   : null
        );
    }

    private void applyRequest(Articulo articulo, ArticuloRequest req) {
        articulo.setTipoMaterial(req.tipoMaterialId() == null ? null :
                tipoMaterialRepository.findById(req.tipoMaterialId())
                        .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", req.tipoMaterialId())));
        articulo.setBrand(req.brandId() == null ? null :
                brandRepository.findById(req.brandId())
                        .orElseThrow(() -> new ResourceNotFoundException("T200Marca", req.brandId())));
        articulo.setAlmacen(req.almacenId() == null ? null :
                almacenRepository.findById(req.almacenId())
                        .orElseThrow(() -> new ResourceNotFoundException("Almacen", req.almacenId())));
        articulo.setModelo(req.modeloId() == null ? null :
                modeloRepository.findById(req.modeloId())
                        .orElseThrow(() -> new ResourceNotFoundException("Modelo", req.modeloId())));
        articulo.setSerialNumber(req.serialNumber());
    }
}
