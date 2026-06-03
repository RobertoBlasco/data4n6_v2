package com.data4n6.inventory.estadoorden.controller;

import com.data4n6.inventory.estadoorden.dto.EstadoOrdenRequest;
import com.data4n6.inventory.estadoorden.dto.EstadoOrdenResponse;
import com.data4n6.inventory.estadoorden.service.EstadoOrdenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/order-statuses")
@RequiredArgsConstructor
@Tag(name = "Inventory - Order Statuses", description = "Order status catalog (Pendiente, En proceso, etc.)")
public class EstadoOrdenController {

    private final EstadoOrdenService service;

    @GetMapping
    @Operation(summary = "List active order statuses")
    public List<EstadoOrdenResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order status by ID")
    public EstadoOrdenResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an order status")
    public EstadoOrdenResponse create(@Valid @RequestBody EstadoOrdenRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an order status")
    public EstadoOrdenResponse update(@PathVariable UUID id, @Valid @RequestBody EstadoOrdenRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an order status")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
