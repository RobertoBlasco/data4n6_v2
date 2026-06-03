package com.data4n6.data4n6.evidence;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.data4n6.evidence.dto.EvidenceStatusRequest;
import com.data4n6.data4n6.evidence.dto.EvidenceStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EvidenceStatusService {

    private final EvidenceStatusRepository repository;
    private final EvidenceMapper mapper;

    public List<EvidenceStatusResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public EvidenceStatusResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("EvidenceStatus", id));
    }

    @Transactional
    public EvidenceStatusResponse create(EvidenceStatusRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public EvidenceStatusResponse update(UUID id, EvidenceStatusRequest request) {
        EvidenceStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvidenceStatus", id));

        status.setName(request.name());
        status.setColor(request.color());
        status.setDisplayOrder(request.displayOrder());
        status.setActive(request.active());

        return mapper.toResponse(repository.save(status));
    }

    @Transactional
    public void delete(UUID id) {
        EvidenceStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EvidenceStatus", id));
        status.softDelete();
        repository.save(status);
    }
}
