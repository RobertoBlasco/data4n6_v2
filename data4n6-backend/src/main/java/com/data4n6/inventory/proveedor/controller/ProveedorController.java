package com.data4n6.inventory.proveedor.controller;

import com.data4n6.inventory.proveedor.dto.ProveedorRequest;
import com.data4n6.inventory.proveedor.dto.ProveedorResponse;
import com.data4n6.inventory.proveedor.service.ProveedorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/proveedores")
@RequiredArgsConstructor
@Tag(name = "Inventory - Proveedores", description = "Suppliers catalog")
public class ProveedorController {

    private final ProveedorService service;

    @GetMapping
    @Operation(summary = "List active suppliers")
    public List<ProveedorResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ProveedorResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a supplier")
    public ProveedorResponse create(@Valid @RequestBody ProveedorRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a supplier")
    public ProveedorResponse update(@PathVariable UUID id, @Valid @RequestBody ProveedorRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a supplier")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
