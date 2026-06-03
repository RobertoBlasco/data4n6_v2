package com.data4n6.inventory.almacen.controller;

import com.data4n6.inventory.almacen.dto.AlmacenRequest;
import com.data4n6.inventory.almacen.dto.AlmacenResponse;
import com.data4n6.inventory.almacen.service.AlmacenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/almacenes")
@RequiredArgsConstructor
@Tag(name = "Inventory - Almacenes", description = "Warehouse management")
public class AlmacenController {

    private final AlmacenService service;

    @GetMapping
    @Operation(summary = "List all active almacenes")
    public List<AlmacenResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get almacén by ID")
    public AlmacenResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an almacén")
    public AlmacenResponse create(@Valid @RequestBody AlmacenRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an almacén")
    public AlmacenResponse update(@PathVariable UUID id, @Valid @RequestBody AlmacenRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an almacén")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
