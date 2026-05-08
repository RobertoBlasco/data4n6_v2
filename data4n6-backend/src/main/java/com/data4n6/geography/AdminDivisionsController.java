package com.data4n6.geography;

import com.data4n6.geography.dto.AdminDivisionRequest;
import com.data4n6.geography.dto.AdminDivisionResponse;
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
@Tag(name = "Admin Divisions", description = "Administrative division catalog management")
public class AdminDivisionsController {

    private final AdminDivisionsService service;

    @GetMapping("/api/v1/admin-divisions")
    @Operation(summary = "List all administrative divisions")
    public List<AdminDivisionResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/api/v1/countries/{countryId}/admin-divisions")
    @Operation(summary = "List administrative divisions by country")
    public List<AdminDivisionResponse> findByCountry(@PathVariable UUID countryId) {
        return service.findByCountry(countryId);
    }

    @GetMapping("/api/v1/admin-divisions/{id}")
    @Operation(summary = "Get administrative division by ID")
    public AdminDivisionResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping("/api/v1/admin-divisions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an administrative division")
    public AdminDivisionResponse create(@Valid @RequestBody AdminDivisionRequest request) {
        return service.create(request);
    }

    @PutMapping("/api/v1/admin-divisions/{id}")
    @Operation(summary = "Update an administrative division")
    public AdminDivisionResponse update(@PathVariable UUID id, @Valid @RequestBody AdminDivisionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/api/v1/admin-divisions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete an administrative division")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
