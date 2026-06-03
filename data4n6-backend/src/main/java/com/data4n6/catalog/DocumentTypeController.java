package com.data4n6.catalog;

import com.data4n6.catalog.dto.DocumentTypeRequest;
import com.data4n6.catalog.dto.DocumentTypeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/document-types")
@RequiredArgsConstructor
@Tag(name = "Catalog - Document Types", description = "Document attachment type catalog")
public class DocumentTypeController {

    private final DocumentTypeService service;

    @GetMapping
    @Operation(summary = "List active document types")
    public List<DocumentTypeResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a document type")
    public DocumentTypeResponse create(@RequestBody DocumentTypeRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a document type")
    public DocumentTypeResponse update(@PathVariable UUID id, @RequestBody DocumentTypeRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a document type")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
