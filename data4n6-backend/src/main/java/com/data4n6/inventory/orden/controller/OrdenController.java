package com.data4n6.inventory.orden.controller;

import com.data4n6.inventory.orden.dto.OrdenResponse;
import com.data4n6.inventory.orden.service.OrdenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/ordenes")
@RequiredArgsConstructor
@Tag(name = "Inventory - Órdenes", description = "Approved order documents")
public class OrdenController {

    private final OrdenService service;

    @GetMapping
    @Operation(summary = "List orders, optionally filtered by event type")
    public List<OrdenResponse> findAll(@RequestParam(required = false) UUID eventoId) {
        return eventoId != null ? service.findByEvento(eventoId) : service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public OrdenResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }
}
