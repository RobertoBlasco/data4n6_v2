package com.data4n6.data4n6.events;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.data4n6.events.dto.EventStatusRequest;
import com.data4n6.data4n6.events.dto.EventStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventStatusService {

    private final EventStatusRepository repository;
    private final EventMapper mapper;

    public List<EventStatusResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public EventStatusResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("EventStatus", id));
    }

    @Transactional
    public EventStatusResponse create(EventStatusRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public EventStatusResponse update(UUID id, EventStatusRequest request) {
        EventStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EventStatus", id));

        status.setName(request.name());
        status.setColor(request.color());
        status.setDisplayOrder(request.displayOrder());
        status.setActive(request.active());

        return mapper.toResponse(repository.save(status));
    }

    @Transactional
    public void delete(UUID id) {
        EventStatus status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EventStatus", id));
        status.softDelete();
        repository.save(status);
    }
}
