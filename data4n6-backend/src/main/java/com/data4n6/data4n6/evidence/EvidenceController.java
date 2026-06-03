package com.data4n6.data4n6.evidence;

import com.data4n6.data4n6.evidence.dto.EvidenceRequest;
import com.data4n6.data4n6.evidence.dto.EvidenceResponse;
import com.data4n6.data4n6.evidence.dto.EvidenceSummaryResponse;
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
@Tag(name = "Evidence", description = "Evidence management")
public class EvidenceController {

    private final EvidenceService service;

    @GetMapping("/api/v1/events/{eventId}/evidence")
    @Operation(summary = "List all evidence for an event")
    public List<EvidenceSummaryResponse> findAllByEvent(@PathVariable UUID eventId) {
        return service.findAllByEvent(eventId);
    }

    @GetMapping("/api/v1/exhibits/{exhibitId}/evidence")
    @Operation(summary = "List all evidence for an exhibit")
    public List<EvidenceSummaryResponse> findAllByExhibit(@PathVariable UUID exhibitId) {
        return service.findAllByExhibit(exhibitId);
    }

    @GetMapping("/api/v1/evidence/{id}")
    @Operation(summary = "Get evidence by ID")
    public EvidenceResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping("/api/v1/evidence")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create new evidence")
    public EvidenceResponse create(@Valid @RequestBody EvidenceRequest request) {
        return service.create(request);
    }

    @PutMapping("/api/v1/evidence/{id}")
    @Operation(summary = "Update evidence")
    public EvidenceResponse update(@PathVariable UUID id, @Valid @RequestBody EvidenceRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/api/v1/evidence/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete evidence")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
