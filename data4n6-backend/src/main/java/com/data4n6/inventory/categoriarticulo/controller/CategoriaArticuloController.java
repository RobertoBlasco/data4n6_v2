package com.data4n6.inventory.categoriarticulo.controller;

import com.data4n6.inventory.categoriarticulo.dto.CategoriaArticuloRequest;
import com.data4n6.inventory.categoriarticulo.dto.CategoriaArticuloResponse;
import com.data4n6.inventory.categoriarticulo.service.CategoriaArticuloService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/categorias-articulos")
@RequiredArgsConstructor
@Tag(name = "Inventory - Categorías de Artículos", description = "Article category catalog")
public class CategoriaArticuloController {

    private final CategoriaArticuloService service;

    @GetMapping
    @Operation(summary = "List all active categorías de artículos")
    public List<CategoriaArticuloResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get categoría de artículo by ID")
    public CategoriaArticuloResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a categoría de artículo")
    public CategoriaArticuloResponse create(@Valid @RequestBody CategoriaArticuloRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a categoría de artículo")
    public CategoriaArticuloResponse update(@PathVariable UUID id, @Valid @RequestBody CategoriaArticuloRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a categoría de artículo")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
