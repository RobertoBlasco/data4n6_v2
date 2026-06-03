package com.data4n6.data4n6.events;

import com.data4n6.data4n6.events.dto.EventStatusRequest;
import com.data4n6.data4n6.events.dto.EventStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/event-statuses")
@RequiredArgsConstructor
@Tag(name = "Event Statuses", description = "Event status catalog management")
public class EventStatusController {

    private final EventStatusService service;

    @GetMapping
    @Operation(summary = "List all event statuses")
    public List<EventStatusResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event status by ID")
    public EventStatusResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an event status")
    public EventStatusResponse create(@Valid @RequestBody EventStatusRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an event status")
    public EventStatusResponse update(@PathVariable UUID id, @Valid @RequestBody EventStatusRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an event status")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
