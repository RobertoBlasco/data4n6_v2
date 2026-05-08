package com.data4n6.cases;

import com.data4n6.cases.dto.CaseLevelRequest;
import com.data4n6.cases.dto.CaseLevelResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseLevelService {

    private final CaseLevelRepository repository;
    private final CaseMapper mapper;

    public List<CaseLevelResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CaseLevelResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CaseLevel", id));
    }

    @Transactional
    public CaseLevelResponse create(CaseLevelRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public CaseLevelResponse update(UUID id, CaseLevelRequest request) {
        CaseLevel level = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseLevel", id));

        level.setName(request.name());
        level.setLevel(request.level());
        level.setDescription(request.description());
        level.setColor(request.color());
        level.setActive(request.active());

        return mapper.toResponse(repository.save(level));
    }

    @Transactional
    public void delete(UUID id) {
        CaseLevel level = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseLevel", id));
        level.softDelete();
        repository.save(level);
    }
}
