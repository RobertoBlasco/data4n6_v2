package com.data4n6.data4n6.units;

import com.data4n6.data4n6.cases.dto.CaseSummaryResponse;
import com.data4n6.data4n6.persons.dto.PersonSummaryResponse;
import com.data4n6.data4n6.units.dto.UnitRequest;
import com.data4n6.data4n6.units.dto.UnitResponse;
import com.data4n6.data4n6.units.dto.UnitStatsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/units")
@RequiredArgsConstructor
@Tag(name = "Units", description = "Organizational units management")
public class UnitController {

    private final UnitService service;

    @GetMapping
    @Operation(summary = "List all active units")
    public List<UnitResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get unit by ID")
    public UnitResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a unit")
    public UnitResponse create(@Valid @RequestBody UnitRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a unit")
    public UnitResponse update(@PathVariable UUID id, @Valid @RequestBody UnitRequest request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}/cases")
    @Operation(summary = "List cases assigned to a unit")
    public List<CaseSummaryResponse> findCases(@PathVariable UUID id) {
        return service.findCasesByUnit(id);
    }

    @GetMapping("/{id}/persons")
    @Operation(summary = "List persons linked to a unit")
    public List<PersonSummaryResponse> findPersons(@PathVariable UUID id) {
        return service.findPersonsByUnit(id);
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Get case statistics for a unit")
    public UnitStatsResponse getStats(@PathVariable UUID id) {
        return service.getStatsByUnit(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a unit")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
