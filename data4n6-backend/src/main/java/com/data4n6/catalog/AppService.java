package com.data4n6.catalog;

import com.data4n6.catalog.dto.AppResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppService {

    private final AppRepository repository;

    public List<AppResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    private AppResponse toResponse(App a) {
        return new AppResponse(a.getId(), a.getName(), a.getDisplayName(), a.getDescription(), a.getIcono());
    }
}
