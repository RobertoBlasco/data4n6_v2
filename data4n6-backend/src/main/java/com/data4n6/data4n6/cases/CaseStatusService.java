package com.data4n6.data4n6.cases;

import com.data4n6.data4n6.cases.dto.CaseStatusRequest;
import com.data4n6.data4n6.cases.dto.CaseStatusResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseStatusService {

    private final CaseStatusRepository repository;
    private final CaseMapper mapper;

    public List<CaseStatusResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CaseStatusResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CaseStatus", id));
    }

    @Transactional
    public CaseStatusResponse create(CaseStatusRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public CaseStatusResponse update(UUID id, CaseStatusRequest request) {
        CaseStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseStatus", id));

        status.setName(request.name());
        status.setColor(request.color());
        status.setDisplayOrder(request.displayOrder());
        status.setActive(request.active());

        return mapper.toResponse(repository.save(status));
    }

    @Transactional
    public void delete(UUID id) {
        CaseStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseStatus", id));
        status.softDelete();
        repository.save(status);
    }
}
