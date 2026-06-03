package com.data4n6.inventory.orden.controller;

import com.data4n6.inventory.orden.dto.LineaOrdenPrestamoResponse;
import com.data4n6.inventory.orden.dto.OrdenDevolucionLibreRequest;
import com.data4n6.inventory.orden.dto.OrdenDevolucionListResponse;
import com.data4n6.inventory.orden.dto.OrdenDevolucionRequest;
import com.data4n6.inventory.orden.dto.OrdenDevolucionResponse;
import com.data4n6.inventory.orden.service.OrdenDevolucionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory - Devoluciones", description = "Loan return orders")
public class OrdenDevolucionController {

    private final OrdenDevolucionService service;

    @GetMapping("/ordenes-devolucion")
    @Operation(summary = "List all return orders")
    public List<OrdenDevolucionListResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/ordenes-prestamo/{id}/lineas-pendientes")
    @Operation(summary = "List pending (unreturned) lines for a loan order")
    public List<LineaOrdenPrestamoResponse> findPendientes(@PathVariable UUID id) {
        return service.findPendientes(id);
    }

    @PostMapping("/ordenes-devolucion")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a return order for a loan")
    public OrdenDevolucionResponse create(@RequestBody @Valid OrdenDevolucionRequest request) {
        return service.create(request);
    }

    @PostMapping("/ordenes-devolucion/por-articulos")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create return orders from a list of prestado articles (auto-resolves loan lines)")
    public List<OrdenDevolucionResponse> createFromArticulos(@RequestBody @Valid OrdenDevolucionLibreRequest request) {
        return service.createFromArticulos(request);
    }
}
