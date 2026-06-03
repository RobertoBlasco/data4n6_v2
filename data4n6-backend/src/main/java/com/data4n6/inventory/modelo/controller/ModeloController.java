package com.data4n6.inventory.modelo.controller;

import com.data4n6.inventory.modelo.dto.ModeloRequest;
import com.data4n6.inventory.modelo.dto.ModeloResponse;
import com.data4n6.inventory.modelo.service.ModeloService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/modelos")
@RequiredArgsConstructor
@Tag(name = "Inventory - Modelos", description = "Model catalog")
public class ModeloController {

    private final ModeloService service;

    @GetMapping
    @Operation(summary = "List active modelos, optionally filtered by marcaId")
    public List<ModeloResponse> findAll(@RequestParam(required = false) UUID marcaId) {
        if (marcaId != null) return service.findByMarca(marcaId);
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get modelo by ID")
    public ModeloResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a modelo")
    public ModeloResponse create(@Valid @RequestBody ModeloRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a modelo")
    public ModeloResponse update(@PathVariable UUID id, @Valid @RequestBody ModeloRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a modelo")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
