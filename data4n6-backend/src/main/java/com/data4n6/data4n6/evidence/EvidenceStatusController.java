package com.data4n6.data4n6.evidence;

import com.data4n6.data4n6.evidence.dto.EvidenceStatusRequest;
import com.data4n6.data4n6.evidence.dto.EvidenceStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/evidence-statuses")
@RequiredArgsConstructor
@Tag(name = "Evidence Statuses", description = "Evidence status catalog management")
public class EvidenceStatusController {

    private final EvidenceStatusService service;

    @GetMapping
    @Operation(summary = "List all evidence statuses")
    public List<EvidenceStatusResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get evidence status by ID")
    public EvidenceStatusResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an evidence status")
    public EvidenceStatusResponse create(@Valid @RequestBody EvidenceStatusRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an evidence status")
    public EvidenceStatusResponse update(@PathVariable UUID id, @Valid @RequestBody EvidenceStatusRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an evidence status")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
