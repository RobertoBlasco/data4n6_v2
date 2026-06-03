package com.data4n6.inventory.orden.controller;

import com.data4n6.inventory.orden.dto.LineaOrdenEntradaResponse;
import com.data4n6.inventory.orden.dto.OrdenEntradaResponse;
import com.data4n6.inventory.orden.service.OrdenEntradaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/ordenes-entrada")
@RequiredArgsConstructor
@Tag(name = "Inventory - Órdenes de entrada", description = "Incoming stock orders")
public class OrdenEntradaController {

    private final OrdenEntradaService service;

    @GetMapping
    @Operation(summary = "List all entrada orders")
    public List<OrdenEntradaResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get entrada order by ID")
    public OrdenEntradaResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/lineas")
    @Operation(summary = "List lines for an entrada order")
    public List<LineaOrdenEntradaResponse> findLineas(@PathVariable UUID id) {
        return service.findLineasByOrdenId(id);
    }
}
