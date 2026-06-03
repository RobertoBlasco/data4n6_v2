package com.data4n6.catalog;

import com.data4n6.catalog.dto.UnitRequest;
import com.data4n6.catalog.dto.UnitResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController("commonUnitController")
@RequestMapping("/api/v1/catalog/units")
@RequiredArgsConstructor
@Tag(name = "Catalog - Units", description = "Organizational units shared across modules")
public class UnitController {

    private final UnitService service;

    @GetMapping
    @Operation(summary = "List active units, optionally filtered by module")
    public List<UnitResponse> findAll(@RequestParam(required = false) String module) {
        if ("inventory".equals(module)) return service.findForInventory();
        if ("data4n6".equals(module))   return service.findForData4n6();
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a unit")
    public UnitResponse create(@RequestBody UnitRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a unit")
    public UnitResponse update(@PathVariable UUID id, @RequestBody UnitRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a unit")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
