package com.data4n6.data4n6.cases;

import com.data4n6.data4n6.cases.dto.CaseRequest;
import com.data4n6.data4n6.cases.dto.CaseResponse;
import com.data4n6.data4n6.cases.dto.CaseSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
@Tag(name = "Cases", description = "Forensic case management")
public class CaseController {

    private final CaseService caseService;

    @GetMapping
    @Operation(summary = "List all active cases")
    public List<CaseSummaryResponse> findAll() {
        return caseService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case by ID")
    public CaseResponse findById(@PathVariable UUID id) {
        return caseService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new case")
    public CaseResponse create(@Valid @RequestBody CaseRequest request) {
        return caseService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a case")
    public CaseResponse update(@PathVariable UUID id, @Valid @RequestBody CaseRequest request) {
        return caseService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a case")
    public void delete(@PathVariable UUID id) {
        caseService.delete(id);
    }
}
