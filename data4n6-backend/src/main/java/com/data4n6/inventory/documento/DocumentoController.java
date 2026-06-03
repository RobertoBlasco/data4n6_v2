package com.data4n6.inventory.documento;

import com.data4n6.inventory.documento.dto.DocumentoRequest;
import com.data4n6.inventory.documento.dto.DocumentoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/documents")
@RequiredArgsConstructor
@Tag(name = "Inventory - Documents")
public class DocumentoController {

    private final DocumentoService service;

    @GetMapping
    @Operation(summary = "List documents for a specific entity record")
    public List<DocumentoResponse> findAll(
            @RequestParam UUID tableId,
            @RequestParam UUID recordId) {
        return service.findByEntity(tableId, recordId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Attach a document to an entity record")
    public DocumentoResponse create(@RequestBody DocumentoRequest req) {
        return service.create(req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a document attachment")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
