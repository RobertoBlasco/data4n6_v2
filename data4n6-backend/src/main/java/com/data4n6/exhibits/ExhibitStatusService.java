package com.data4n6.exhibits;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.exhibits.dto.ExhibitStatusRequest;
import com.data4n6.exhibits.dto.ExhibitStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExhibitStatusService {

    private final ExhibitStatusRepository repository;
    private final ExhibitMapper mapper;

    public List<ExhibitStatusResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ExhibitStatusResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ExhibitStatus", id));
    }

    @Transactional
    public ExhibitStatusResponse create(ExhibitStatusRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public ExhibitStatusResponse update(UUID id, ExhibitStatusRequest request) {
        ExhibitStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExhibitStatus", id));

        status.setName(request.name());
        status.setColor(request.color());
        status.setDisplayOrder(request.displayOrder());
        status.setActive(request.active());

        return mapper.toResponse(repository.save(status));
    }

    @Transactional
    public void delete(UUID id) {
        ExhibitStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExhibitStatus", id));
        status.softDelete();
        repository.save(status);
    }
}
