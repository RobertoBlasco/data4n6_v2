package com.data4n6.inventory.propuesta.controller;

import com.data4n6.inventory.propuesta.dto.AprobarRequest;
import com.data4n6.inventory.propuesta.dto.LineaPropuestaRequest;
import com.data4n6.inventory.propuesta.dto.LineaPropuestaResponse;
import com.data4n6.inventory.propuesta.dto.PropuestaRequest;
import com.data4n6.inventory.propuesta.dto.PropuestaResponse;
import com.data4n6.inventory.propuesta.service.PropuestaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/propuestas")
@RequiredArgsConstructor
@Tag(name = "Inventory - Propuestas", description = "Proposal documents")
public class PropuestaController {

    private final PropuestaService service;

    @GetMapping
    @Operation(summary = "List active proposals, optionally filtered by event type")
    public List<PropuestaResponse> findAll(@RequestParam(required = false) UUID eventoId) {
        return eventoId != null ? service.findByEvento(eventoId) : service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get proposal by ID")
    public PropuestaResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/{id}/lineas")
    @Operation(summary = "List lines of a proposal")
    public List<LineaPropuestaResponse> findLineas(@PathVariable UUID id) {
        return service.findLineas(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a proposal (starts in 'borrador' state)")
    public PropuestaResponse create(@Valid @RequestBody PropuestaRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a proposal (only in 'borrador' state)")
    public PropuestaResponse update(@PathVariable UUID id, @Valid @RequestBody PropuestaRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a proposal (only in 'borrador' state)")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    // ── Lines ─────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/lineas")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a line to a proposal")
    public LineaPropuestaResponse addLinea(@PathVariable UUID id, @Valid @RequestBody LineaPropuestaRequest request) {
        return service.addLinea(id, request);
    }

    @PutMapping("/{id}/lineas/{lineaId}")
    @Operation(summary = "Update a line in a proposal")
    public LineaPropuestaResponse updateLinea(@PathVariable UUID id, @PathVariable UUID lineaId,
                                               @Valid @RequestBody LineaPropuestaRequest request) {
        return service.updateLinea(id, lineaId, request);
    }

    @DeleteMapping("/{id}/lineas/{lineaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a line from a proposal")
    public void deleteLinea(@PathVariable UUID id, @PathVariable UUID lineaId) {
        service.deleteLinea(id, lineaId);
    }

    // ── State transitions ──────────────────────────────────────────────────────

    @PostMapping("/{id}/enviar")
    @Operation(summary = "Submit proposal for approval (borrador → enviada)")
    public PropuestaResponse enviar(@PathVariable UUID id) {
        return service.enviar(id);
    }

    @PostMapping("/{id}/rechazar")
    @Operation(summary = "Reject a submitted proposal (enviada → rechazada)")
    public PropuestaResponse rechazar(@PathVariable UUID id,
                                       @RequestParam(required = false) String notas) {
        return service.rechazar(id, notas);
    }

    @PostMapping("/{id}/aprobar")
    @Operation(summary = "Approve proposal, execute all lines, and generate order (enviada → aprobada)")
    public PropuestaResponse aprobar(@PathVariable UUID id, @Valid @RequestBody AprobarRequest request) {
        return service.aprobar(id, request);
    }
}
