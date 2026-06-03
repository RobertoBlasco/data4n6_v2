package com.data4n6.inventory.foto;

import com.data4n6.inventory.foto.dto.FotoRequest;
import com.data4n6.inventory.foto.dto.FotoResponse;
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
@RequestMapping("/api/v1/inventory/pictures")
@RequiredArgsConstructor
@Tag(name = "Inventory - Pictures")
public class FotoController {

    private final FotoService service;

    @GetMapping
    @Operation(summary = "List pictures for a specific entity record")
    public List<FotoResponse> findAll(
            @RequestParam UUID tableId,
            @RequestParam UUID recordId) {
        return service.findByEntity(tableId, recordId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a picture to an entity record")
    public FotoResponse create(@RequestBody FotoRequest req) {
        return service.create(req);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload and attach a picture file to an entity record")
    public FotoResponse upload(
            @RequestParam UUID appTableId,
            @RequestParam UUID recordId,
            @RequestParam(required = false) UUID pictureTypeId,
            @RequestParam(defaultValue = "false") boolean esPrincipal,
            @RequestParam(required = false) String caption,
            @RequestParam MultipartFile file) {
        return service.upload(appTableId, recordId, pictureTypeId, esPrincipal, caption, file);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a picture")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
