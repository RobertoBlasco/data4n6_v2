package com.data4n6.data4n6.exhibits;

import com.data4n6.data4n6.exhibits.dto.ExhibitStatusRequest;
import com.data4n6.data4n6.exhibits.dto.ExhibitStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exhibit-statuses")
@RequiredArgsConstructor
@Tag(name = "Exhibit Statuses", description = "Exhibit status catalog management")
public class ExhibitStatusController {

    private final ExhibitStatusService service;

    @GetMapping
    @Operation(summary = "List all exhibit statuses")
    public List<ExhibitStatusResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exhibit status by ID")
    public ExhibitStatusResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an exhibit status")
    public ExhibitStatusResponse create(@Valid @RequestBody ExhibitStatusRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an exhibit status")
    public ExhibitStatusResponse update(@PathVariable UUID id, @Valid @RequestBody ExhibitStatusRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an exhibit status")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
