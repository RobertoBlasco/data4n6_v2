package com.data4n6.catalog;

import com.data4n6.catalog.dto.AgentRequest;
import com.data4n6.catalog.dto.AgentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@RestController("commonAgentController")
@RequestMapping("/api/v1/catalog/agents")
@RequiredArgsConstructor
@Tag(name = "Catalog - Agents", description = "Agents shared across modules")
public class AgentController {

    private final AgentService service;

    @GetMapping
    @Operation(summary = "List active agents, optionally filtered by unit")
    public List<AgentResponse> findAll(@RequestParam(required = false) UUID unitId) {
        return service.findAll(unitId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an agent by id")
    public AgentResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an agent")
    public AgentResponse create(@RequestBody AgentRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an agent")
    public AgentResponse update(@PathVariable UUID id, @RequestBody AgentRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an agent")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
