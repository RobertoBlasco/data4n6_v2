package com.data4n6.geography;

import com.data4n6.geography.dto.CountryRequest;
import com.data4n6.geography.dto.CountryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/countries")
@RequiredArgsConstructor
@Tag(name = "Countries", description = "Country catalog management")
public class CountriesController {

    private final CountriesService service;

    @GetMapping
    @Operation(summary = "List all countries")
    public List<CountryResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get country by ID")
    public CountryResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a country")
    public CountryResponse create(@Valid @RequestBody CountryRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a country")
    public CountryResponse update(@PathVariable UUID id, @Valid @RequestBody CountryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a country")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
