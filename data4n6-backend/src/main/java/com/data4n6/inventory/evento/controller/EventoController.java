package com.data4n6.inventory.evento.controller;

import com.data4n6.inventory.evento.dto.EventoRequest;
import com.data4n6.inventory.evento.dto.EventoResponse;
import com.data4n6.inventory.evento.service.EventoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/eventos")
@RequiredArgsConstructor
@Tag(name = "Inventory - Eventos", description = "Inventory event type catalog")
public class EventoController {

    private final EventoService service;

    @GetMapping
    @Operation(summary = "List all eventos")
    public List<EventoResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get evento by ID")
    public EventoResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an evento")
    public EventoResponse create(@Valid @RequestBody EventoRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an evento")
    public EventoResponse update(@PathVariable UUID id, @Valid @RequestBody EventoRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an evento")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
