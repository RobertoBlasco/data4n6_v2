package com.data4n6.inventory.eventotransicion.controller;

import com.data4n6.inventory.eventotransicion.dto.AccionDisponibleResponse;
import com.data4n6.inventory.eventotransicion.dto.EventoTransicionRequest;
import com.data4n6.inventory.eventotransicion.dto.EventoTransicionResponse;
import com.data4n6.inventory.eventotransicion.service.EventoTransicionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/evento-transiciones")
@RequiredArgsConstructor
@Tag(name = "Inventory - Evento Transiciones", description = "Event succession rules")
public class EventoTransicionController {

    private final EventoTransicionService service;

    @GetMapping
    @Operation(summary = "List all event transitions")
    public List<EventoTransicionResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/acciones-disponibles")
    @Operation(summary = "Compute intersection of allowed next events for a set of estadoActual values")
    public List<AccionDisponibleResponse> findAccionesDisponibles(
            @RequestParam List<String> estado) {
        return service.findAccionesDisponibles(estado);
    }

    @GetMapping("/by-origen/{origenId}")
    @Operation(summary = "List transitions by origin event")
    public List<EventoTransicionResponse> findByOrigen(@PathVariable UUID origenId) {
        return service.findByOrigen(origenId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event transition by ID")
    public EventoTransicionResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an event transition")
    public EventoTransicionResponse create(@Valid @RequestBody EventoTransicionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an event transition")
    public EventoTransicionResponse update(@PathVariable UUID id, @Valid @RequestBody EventoTransicionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an event transition")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
