package com.data4n6.cases;

import com.data4n6.cases.dto.CaseLevelRequest;
import com.data4n6.cases.dto.CaseLevelResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/case-levels")
@RequiredArgsConstructor
@Tag(name = "Case Levels", description = "Case classification level catalog management")
public class CaseLevelController {

    private final CaseLevelService service;

    @GetMapping
    @Operation(summary = "List all case levels")
    public List<CaseLevelResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case level by ID")
    public CaseLevelResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a case level")
    public CaseLevelResponse create(@Valid @RequestBody CaseLevelRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a case level")
    public CaseLevelResponse update(@PathVariable UUID id, @Valid @RequestBody CaseLevelRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete a case level")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
