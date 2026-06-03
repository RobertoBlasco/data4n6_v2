package com.data4n6.data4n6.events;

import com.data4n6.data4n6.events.dto.EventRequest;
import com.data4n6.data4n6.events.dto.EventResponse;
import com.data4n6.data4n6.events.dto.EventSummaryResponse;
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
@Tag(name = "Events", description = "Case event management")
public class EventController {

    private final EventService service;

    @GetMapping("/api/v1/cases/{caseId}/events")
    @Operation(summary = "List all events for a case")
    public List<EventSummaryResponse> findAllByCase(@PathVariable UUID caseId) {
        return service.findAllByCase(caseId);
    }

    @GetMapping("/api/v1/events/{id}")
    @Operation(summary = "Get event by ID")
    public EventResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping("/api/v1/events")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new event")
    public EventResponse create(@Valid @RequestBody EventRequest request) {
        return service.create(request);
    }

    @PutMapping("/api/v1/events/{id}")
    @Operation(summary = "Update an event")
    public EventResponse update(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/api/v1/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an event")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
