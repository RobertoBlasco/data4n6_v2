package com.data4n6.inventory.documento;

import com.data4n6.inventory.documento.dto.DocumentoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload a document file to object storage")
    public DocumentoResponse upload(
            @RequestParam UUID appTableId,
            @RequestParam UUID recordId,
            @RequestParam(required = false) UUID documentTypeId,
            @RequestParam(required = false) String description,
            @RequestParam("file") MultipartFile file) {
        return service.upload(appTableId, recordId, documentTypeId, description, file);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a document attachment")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
