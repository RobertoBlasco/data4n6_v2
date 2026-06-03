package com.data4n6.inventory.material.controller;

import com.data4n6.inventory.material.dto.MaterialRequest;
import com.data4n6.inventory.material.dto.MaterialResponse;
import com.data4n6.inventory.material.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/materiales")
@RequiredArgsConstructor
@Tag(name = "Inventory - Materiales", description = "Physical material catalogue (type + brand + model)")
public class MaterialController {

    private final MaterialService service;

    @GetMapping
    @Operation(summary = "List all active materiales")
    public List<MaterialResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get material by ID")
    public MaterialResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a material")
    public MaterialResponse create(@Valid @RequestBody MaterialRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a material")
    public MaterialResponse update(@PathVariable UUID id, @Valid @RequestBody MaterialRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a material")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
