package com.data4n6.report;

import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoResponse;
import com.data4n6.inventory.orden.dto.OrdenPrestamoResponse;
import com.data4n6.inventory.orden.service.OrdenPrestamoService;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmbeddedReportService implements ReportService {

    private final OrdenPrestamoService ordenPrestamoService;

    private static final DateTimeFormatter DATE_FMT     = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public byte[] reciboPrestamo(UUID ordenId) {
        OrdenPrestamoResponse orden  = ordenPrestamoService.findById(ordenId);
        List<LineaOrdenPrestamoResponse> lineas = ordenPrestamoService.findLineasByOrdenId(ordenId);

        try (InputStream is = getClass().getResourceAsStream("/reports/recibo-prestamo.jrxml")) {
            if (is == null) throw new IllegalStateException("Plantilla recibo-prestamo.jrxml no encontrada");

            JasperReport compiled = JasperCompileManager.compileReport(is);
            JasperPrint  print    = JasperFillManager.fillReport(compiled, buildParams(orden), buildDs(lineas));
            return JasperExportManager.exportReportToPdf(print);

        } catch (JRException e) {
            throw new RuntimeException("Error generando recibo PDF", e);
        } catch (Exception e) {
            throw new RuntimeException("Error generando recibo PDF", e);
        }
    }

    private Map<String, Object> buildParams(OrdenPrestamoResponse o) {
        Map<String, Object> p = new HashMap<>();
        p.put("NUMERO_REFERENCIA", o.numeroReferencia() != null ? o.numeroReferencia() : "—");
        p.put("FECHA_CREACION", o.aprobadoEn() != null
                ? o.aprobadoEn().atZone(ZoneId.systemDefault()).format(DATETIME_FMT) : "—");
        p.put("UNIDAD_ORIGEN",  nvl(o.unidadOrigenNombre()));
        p.put("AGENTE_ORIGEN",  nvl(o.agenteOrigenNombre()));
        p.put("UNIDAD_DESTINO", nvl(o.unidadDestinoNombre()));
        p.put("AGENTE_DESTINO", nvl(o.agenteDestinoNombre()));
        p.put("FECHA_INICIO", o.fechaInicio() != null
                ? o.fechaInicio().atZone(ZoneId.systemDefault()).toLocalDate().format(DATE_FMT) : "—");
        p.put("FECHA_DEVOLUCION", o.fechaDevolucion() != null
                ? o.fechaDevolucion().format(DATE_FMT) : "—");
        p.put("CASO_REFERENCIA", nvl(o.casosReference()));
        return p;
    }

    private JRMapCollectionDataSource buildDs(List<LineaOrdenPrestamoResponse> lineas) {
        List<Map<String, ?>> rows = lineas.stream().<Map<String, ?>>map(l -> {
            Map<String, Object> row = new HashMap<>();
            row.put("tipo",    nvl(l.tipoMaterialNombre()));
            row.put("marca",   nvl(l.marcaNombre()));
            row.put("modelo",  nvl(l.modeloDescripcion()));
            row.put("nSerie",  nvl(l.articuloSerialNumber()));
            row.put("almacen", nvl(l.almacenNombre()));
            return row;
        }).toList();
        return new JRMapCollectionDataSource(rows);
    }

    private static String nvl(String s) { return s != null ? s : "—"; }
}
