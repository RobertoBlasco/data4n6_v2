package com.data4n6.inventory.articulo.controller;

import com.data4n6.inventory.articulo.dto.ArticuloMovimientoResponse;
import com.data4n6.inventory.articulo.dto.ArticuloRequest;
import com.data4n6.inventory.articulo.dto.ArticuloResponse;
import com.data4n6.inventory.articulo.service.ArticuloService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/articulos")
@RequiredArgsConstructor
@Tag(name = "Inventory - Artículos", description = "Physical inventory articles")
public class ArticuloController {

    private final ArticuloService service;

    @GetMapping
    @Operation(summary = "List all active artículos")
    public List<ArticuloResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get artículo by ID")
    public ArticuloResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an artículo")
    public ArticuloResponse create(@Valid @RequestBody ArticuloRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}/historial")
    @Operation(summary = "Get movement history for an artículo")
    public List<ArticuloMovimientoResponse> findHistorial(@PathVariable UUID id) {
        return service.findHistorial(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an artículo")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
