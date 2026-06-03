package com.data4n6.inventory.identdoc;

import com.data4n6.inventory.identdoc.dto.IdentDocRequest;
import com.data4n6.inventory.identdoc.dto.IdentDocResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/ident-docs")
@RequiredArgsConstructor
@Tag(name = "Inventory - Identification Documents")
public class IdentDocController {

    private final IdentDocService service;

    @GetMapping
    @Operation(summary = "List identification documents for a specific entity record")
    public List<IdentDocResponse> findAll(
            @RequestParam UUID tableId,
            @RequestParam UUID recordId) {
        return service.findByEntity(tableId, recordId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add an identification document to an entity record")
    public IdentDocResponse create(@RequestBody IdentDocRequest req) {
        return service.create(req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an identification document")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
