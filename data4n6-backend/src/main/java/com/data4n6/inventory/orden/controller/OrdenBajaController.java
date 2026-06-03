package com.data4n6.inventory.orden.controller;

import com.data4n6.inventory.orden.dto.LineaOrdenBajaResponse;
import com.data4n6.inventory.orden.dto.OrdenBajaResponse;
import com.data4n6.inventory.orden.service.OrdenBajaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/ordenes-baja")
@RequiredArgsConstructor
@Tag(name = "Inventory - Órdenes de baja", description = "Decommission orders")
public class OrdenBajaController {

    private final OrdenBajaService service;

    @GetMapping
    @Operation(summary = "List all decommission orders")
    public List<OrdenBajaResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get decommission order by ID")
    public OrdenBajaResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/lineas")
    @Operation(summary = "List lines for a decommission order")
    public List<LineaOrdenBajaResponse> findLineas(@PathVariable UUID id) {
        return service.findLineasByOrdenId(id);
    }
}
