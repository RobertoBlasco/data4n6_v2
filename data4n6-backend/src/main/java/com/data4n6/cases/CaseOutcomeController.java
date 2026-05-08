package com.data4n6.cases;

import com.data4n6.cases.dto.CaseOutcomeRequest;
import com.data4n6.cases.dto.CaseOutcomeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/case-outcomes")
@RequiredArgsConstructor
@Tag(name = "Case Outcomes", description = "Case outcome catalog management")
public class CaseOutcomeController {

    private final CaseOutcomeService service;

    @GetMapping
    @Operation(summary = "List all case outcomes")
    public List<CaseOutcomeResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case outcome by ID")
    public CaseOutcomeResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a case outcome")
    public CaseOutcomeResponse create(@Valid @RequestBody CaseOutcomeRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a case outcome")
    public CaseOutcomeResponse update(@PathVariable UUID id, @Valid @RequestBody CaseOutcomeRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a case outcome")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
