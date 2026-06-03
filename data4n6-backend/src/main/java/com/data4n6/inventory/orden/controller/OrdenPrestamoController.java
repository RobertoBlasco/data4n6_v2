package com.data4n6.inventory.orden.controller;

import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoDetalleResponse;
import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoResponse;
import com.data4n6.inventory.orden.dto.OrdenPrestamoRequest;
import com.data4n6.inventory.orden.dto.OrdenPrestamoResponse;
import com.data4n6.inventory.orden.service.OrdenPrestamoService;
import com.data4n6.report.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/ordenes-prestamo")
@RequiredArgsConstructor
@Tag(name = "Inventory - Órdenes de préstamo", description = "Loan orders")
public class OrdenPrestamoController {

    private final OrdenPrestamoService service;
    private final ReportService        reportService;

    @GetMapping
    @Operation(summary = "List all loan orders")
    public List<OrdenPrestamoResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get loan order by ID")
    public OrdenPrestamoResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/lineas")
    @Operation(summary = "List lines for a loan order")
    public List<LineaOrdenPrestamoResponse> findLineas(@PathVariable UUID id) {
        return service.findLineasByOrdenId(id);
    }

    @GetMapping("/{id}/lineas-detalle")
    @Operation(summary = "List lines with return status for a loan order")
    public List<LineaOrdenPrestamoDetalleResponse> findLineasDetalle(@PathVariable UUID id) {
        return service.findLineasDetalle(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new loan order")
    public OrdenPrestamoResponse create(@RequestBody @Valid OrdenPrestamoRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}/recibo")
    @Operation(summary = "Generate receipt PDF for a loan order")
    public ResponseEntity<byte[]> recibo(@PathVariable UUID id) {
        byte[] pdf = reportService.reciboPrestamo(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"recibo-" + id + ".pdf\"")
                .body(pdf);
    }
}
