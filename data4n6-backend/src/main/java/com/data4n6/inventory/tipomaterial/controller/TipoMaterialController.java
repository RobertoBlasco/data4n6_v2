package com.data4n6.inventory.tipomaterial.controller;

import com.data4n6.inventory.tipomaterial.dto.TipoMaterialRequest;
import com.data4n6.inventory.tipomaterial.dto.TipoMaterialResponse;
import com.data4n6.inventory.tipomaterial.service.TipoMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/tipos-material")
@RequiredArgsConstructor
@Tag(name = "Inventory - Tipos de material", description = "Catálogo de tipos de material")
public class TipoMaterialController {

    private final TipoMaterialService service;

    @GetMapping
    @Operation(summary = "Listar tipos de material activos")
    public List<TipoMaterialResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener tipo de material por ID")
    public TipoMaterialResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear tipo de material")
    public TipoMaterialResponse create(@Valid @RequestBody TipoMaterialRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar tipo de material")
    public TipoMaterialResponse update(@PathVariable UUID id, @Valid @RequestBody TipoMaterialRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar tipo de material (soft delete)")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
