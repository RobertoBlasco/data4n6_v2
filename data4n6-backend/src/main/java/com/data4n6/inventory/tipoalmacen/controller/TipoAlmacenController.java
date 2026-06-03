package com.data4n6.inventory.tipoalmacen.controller;

import com.data4n6.inventory.tipoalmacen.dto.TipoAlmacenRequest;
import com.data4n6.inventory.tipoalmacen.dto.TipoAlmacenResponse;
import com.data4n6.inventory.tipoalmacen.service.TipoAlmacenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/tipos-almacen")
@RequiredArgsConstructor
@Tag(name = "Inventory - Tipos de Almacén", description = "Warehouse type catalog")
public class TipoAlmacenController {

    private final TipoAlmacenService service;

    @GetMapping
    @Operation(summary = "List all active tipos de almacén")
    public List<TipoAlmacenResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tipo de almacén by ID")
    public TipoAlmacenResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a tipo de almacén")
    public TipoAlmacenResponse create(@Valid @RequestBody TipoAlmacenRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tipo de almacén")
    public TipoAlmacenResponse update(@PathVariable UUID id, @Valid @RequestBody TipoAlmacenRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a tipo de almacén")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
