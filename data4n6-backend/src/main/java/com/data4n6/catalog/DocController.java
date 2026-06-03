package com.data4n6.catalog;

import com.data4n6.catalog.dto.DocRequest;
import com.data4n6.catalog.dto.DocResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/docs")
@RequiredArgsConstructor
@Tag(name = "Catalog - Docs", description = "Identity document types")
public class DocController {

    private final DocService service;

    @GetMapping
    @Operation(summary = "List active document types")
    public List<DocResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a document type")
    public DocResponse create(@RequestBody DocRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a document type")
    public DocResponse update(@PathVariable UUID id, @RequestBody DocRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a document type")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
