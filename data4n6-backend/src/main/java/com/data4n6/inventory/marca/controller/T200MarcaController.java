package com.data4n6.inventory.marca.controller;

import com.data4n6.inventory.marca.dto.T200MarcaRequest;
import com.data4n6.inventory.marca.dto.T200MarcaResponse;
import com.data4n6.inventory.marca.service.T200MarcaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/brands")
@RequiredArgsConstructor
@Tag(name = "Inventory - Brands", description = "Equipment brand catalog")
public class T200MarcaController {

    private final T200MarcaService service;

    @GetMapping
    @Operation(summary = "List all active brands")
    public List<T200MarcaResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public T200MarcaResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a brand")
    public T200MarcaResponse create(@Valid @RequestBody T200MarcaRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a brand")
    public T200MarcaResponse update(@PathVariable UUID id, @Valid @RequestBody T200MarcaRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a brand")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
