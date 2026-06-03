package com.data4n6.inventory.tipoentrada.controller;

import com.data4n6.inventory.tipoentrada.dto.TipoEntradaRequest;
import com.data4n6.inventory.tipoentrada.dto.TipoEntradaResponse;
import com.data4n6.inventory.tipoentrada.service.TipoEntradaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/entry-types")
@RequiredArgsConstructor
@Tag(name = "Inventory - Entry Types", description = "Entry type catalog (compra, donación, etc.)")
public class TipoEntradaController {

    private final TipoEntradaService service;

    @GetMapping
    @Operation(summary = "List active entry types")
    public List<TipoEntradaResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get entry type by ID")
    public TipoEntradaResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an entry type")
    public TipoEntradaResponse create(@Valid @RequestBody TipoEntradaRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an entry type")
    public TipoEntradaResponse update(@PathVariable UUID id, @Valid @RequestBody TipoEntradaRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an entry type")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
