package com.data4n6.data4n6.persons;

import com.data4n6.data4n6.persons.dto.PersonRequest;
import com.data4n6.data4n6.persons.dto.PersonResponse;
import com.data4n6.data4n6.persons.dto.PersonRoleResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/persons")
@RequiredArgsConstructor
@Tag(name = "Persons", description = "Persons management")
public class PersonController {

    private final PersonService service;

    @GetMapping("/roles")
    @Operation(summary = "List active person roles")
    public List<PersonRoleResponse> findRoles() {
        return service.findAllRoles();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a person and link it to an entity")
    public PersonResponse create(@Valid @RequestBody PersonRequest request) {
        return service.create(request);
    }
}
