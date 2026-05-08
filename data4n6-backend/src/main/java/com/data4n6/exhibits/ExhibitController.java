package com.data4n6.exhibits;

import com.data4n6.exhibits.dto.ExhibitRequest;
import com.data4n6.exhibits.dto.ExhibitResponse;
import com.data4n6.exhibits.dto.ExhibitSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Exhibits", description = "Exhibit management")
public class ExhibitController {

    private final ExhibitService service;

    @GetMapping("/api/v1/events/{eventId}/exhibits")
    @Operation(summary = "List all exhibits for an event")
    public List<ExhibitSummaryResponse> findAllByEvent(@PathVariable UUID eventId) {
        return service.findAllByEvent(eventId);
    }

    @GetMapping("/api/v1/exhibits/{id}")
    @Operation(summary = "Get exhibit by ID")
    public ExhibitResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping("/api/v1/exhibits")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new exhibit")
    public ExhibitResponse create(@Valid @RequestBody ExhibitRequest request) {
        return service.create(request);
    }

    @PutMapping("/api/v1/exhibits/{id}")
    @Operation(summary = "Update an exhibit")
    public ExhibitResponse update(@PathVariable UUID id, @Valid @RequestBody ExhibitRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/api/v1/exhibits/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an exhibit")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
