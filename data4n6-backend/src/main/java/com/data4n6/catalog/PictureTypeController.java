package com.data4n6.catalog;

import com.data4n6.catalog.dto.PictureTypeRequest;
import com.data4n6.catalog.dto.PictureTypeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/picture-types")
@RequiredArgsConstructor
@Tag(name = "Catalog - Picture Types", description = "Picture / image type catalog")
public class PictureTypeController {

    private final PictureTypeService service;

    @GetMapping
    @Operation(summary = "List active picture types")
    public List<PictureTypeResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a picture type")
    public PictureTypeResponse create(@RequestBody PictureTypeRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a picture type")
    public PictureTypeResponse update(@PathVariable UUID id, @RequestBody PictureTypeRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a picture type")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
