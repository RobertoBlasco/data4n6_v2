package com.data4n6.inventory.nota;

import com.data4n6.inventory.nota.dto.NotaRequest;
import com.data4n6.inventory.nota.dto.NotaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/notes")
@RequiredArgsConstructor
@Tag(name = "Inventory - Notes")
public class NotaController {

    private final NotaService service;

    @GetMapping
    @Operation(summary = "List notes for a specific entity record")
    public List<NotaResponse> findAll(
            @RequestParam UUID tableId,
            @RequestParam UUID recordId) {
        return service.findByEntity(tableId, recordId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a note to an entity record")
    public NotaResponse create(@RequestBody NotaRequest req) {
        return service.create(req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a note")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
