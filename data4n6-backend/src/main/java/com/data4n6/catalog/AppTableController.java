package com.data4n6.catalog;

import com.data4n6.catalog.dto.AppTableRequest;
import com.data4n6.catalog.dto.AppTableResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/app-tables")
@RequiredArgsConstructor
@Tag(name = "Catalog - App Tables", description = "UI metadata registry for all application tables")
public class AppTableController {

    private final AppTableService service;

    @GetMapping
    @Operation(summary = "List all registered tables, optionally filtered by menu section")
    public List<AppTableResponse> findAll(@RequestParam(required = false) String seccion) {
        return seccion != null ? service.findBySeccion(seccion) : service.findAll();
    }

    @GetMapping("/id/{id}")
    @Operation(summary = "Get UI metadata for a specific table by its UUID")
    public AppTableResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/{tableName}")
    @Operation(summary = "Get UI metadata for a specific table by its table_name")
    public AppTableResponse findByTableName(@PathVariable String tableName) {
        return service.findByTableName(tableName);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new table in the UI metadata registry")
    public AppTableResponse create(@RequestBody AppTableRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update UI metadata for a registered table")
    public AppTableResponse update(@PathVariable UUID id, @RequestBody AppTableRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a table from the UI metadata registry")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
