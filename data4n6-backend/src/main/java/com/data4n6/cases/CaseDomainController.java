package com.data4n6.cases;

import com.data4n6.cases.dto.CaseDomainRequest;
import com.data4n6.cases.dto.CaseDomainResponse;
import com.data4n6.cases.dto.CaseSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/case-domains")
@RequiredArgsConstructor
@Tag(name = "Case Domains", description = "Case domain catalog management")
public class CaseDomainController {

    private final CaseDomainService service;

    @GetMapping
    @Operation(summary = "List all case domains")
    public List<CaseDomainResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case domain by ID")
    public CaseDomainResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a case domain")
    public CaseDomainResponse create(@Valid @RequestBody CaseDomainRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a case domain")
    public CaseDomainResponse update(@PathVariable UUID id, @Valid @RequestBody CaseDomainRequest request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}/cases")
    @Operation(summary = "List cases assigned to a domain")
    public List<CaseSummaryResponse> findCases(@PathVariable UUID id) {
        return service.findCasesByDomain(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a case domain")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
