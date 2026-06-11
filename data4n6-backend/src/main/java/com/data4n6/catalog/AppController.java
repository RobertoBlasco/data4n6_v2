package com.data4n6.catalog;

import com.data4n6.catalog.dto.AppResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/apps")
@RequiredArgsConstructor
public class AppController {

    private final AppService service;

    @GetMapping
    public List<AppResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{name}")
    public AppResponse findByName(@PathVariable String name) {
        return service.findByName(name);
    }
}
