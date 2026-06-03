package com.data4n6.inventory.materialmarca.controller;

import com.data4n6.inventory.materialmarca.dto.MaterialMarcaRequest;
import com.data4n6.inventory.materialmarca.dto.MaterialMarcaResponse;
import com.data4n6.inventory.materialmarca.service.MaterialMarcaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/materiales-marcas")
@RequiredArgsConstructor
@Tag(name = "Inventory - MaterialesMarcas", description = "Valid brand × material-type combinations")
public class MaterialMarcaController {

    private final MaterialMarcaService service;

    @GetMapping
    @Operation(summary = "List active combinations, optionally filtered by marcaId or tipoMaterialId")
    public List<MaterialMarcaResponse> findAll(
            @RequestParam(required = false) UUID marcaId,
            @RequestParam(required = false) UUID tipoMaterialId) {
        if (marcaId != null)         return service.findByMarca(marcaId);
        if (tipoMaterialId != null)  return service.findByTipoMaterial(tipoMaterialId);
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a brand × material-type combination")
    public MaterialMarcaResponse create(@Valid @RequestBody MaterialMarcaRequest request) {
        return service.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft-delete a combination")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
