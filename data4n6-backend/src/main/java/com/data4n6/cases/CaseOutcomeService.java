package com.data4n6.cases;

import com.data4n6.cases.dto.CaseOutcomeRequest;
import com.data4n6.cases.dto.CaseOutcomeResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseOutcomeService {

    private final CaseOutcomeRepository repository;
    private final CaseMapper mapper;

    public List<CaseOutcomeResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CaseOutcomeResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CaseOutcome", id));
    }

    @Transactional
    public CaseOutcomeResponse create(CaseOutcomeRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public CaseOutcomeResponse update(UUID id, CaseOutcomeRequest request) {
        CaseOutcome outcome = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseOutcome", id));

        outcome.setName(request.name());
        outcome.setDescription(request.description());
        outcome.setDisplayOrder(request.displayOrder());
        outcome.setActive(request.active());

        return mapper.toResponse(repository.save(outcome));
    }

    @Transactional
    public void delete(UUID id) {
        CaseOutcome outcome = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseOutcome", id));
        outcome.softDelete();
        repository.save(outcome);
    }
}
