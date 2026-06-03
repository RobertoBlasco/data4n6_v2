package com.data4n6.catalog;

import com.data4n6.catalog.dto.TableFieldRequest;
import com.data4n6.catalog.dto.TableFieldResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/table-fields")
@RequiredArgsConstructor
@Tag(name = "Catalog - Table Fields", description = "Field-level metadata for generic form and grid rendering")
public class TableFieldController {

    private final TableFieldService service;

    @GetMapping
    @Operation(summary = "List field definitions for a given table")
    public List<TableFieldResponse> findByAppTable(@RequestParam UUID tableId) {
        return service.findByAppTable(tableId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a field definition")
    public TableFieldResponse create(@RequestBody TableFieldRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a field definition")
    public TableFieldResponse update(@PathVariable UUID id, @RequestBody TableFieldRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a field definition")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
