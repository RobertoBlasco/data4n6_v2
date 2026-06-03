package com.data4n6.data4n6.cases;

import com.data4n6.data4n6.cases.dto.CaseStatusRequest;
import com.data4n6.data4n6.cases.dto.CaseStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/case-statuses")
@RequiredArgsConstructor
@Tag(name = "Case Statuses", description = "Case status catalog management")
public class CaseStatusController {

    private final CaseStatusService service;

    @GetMapping
    @Operation(summary = "List all case statuses")
    public List<CaseStatusResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case status by ID")
    public CaseStatusResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a case status")
    public CaseStatusResponse create(@Valid @RequestBody CaseStatusRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a case status")
    public CaseStatusResponse update(@PathVariable UUID id, @Valid @RequestBody CaseStatusRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a case status")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
