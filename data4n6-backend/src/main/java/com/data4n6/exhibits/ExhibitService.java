package com.data4n6.exhibits;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.events.Event;
import com.data4n6.events.EventRepository;
import com.data4n6.exhibits.dto.ExhibitRequest;
import com.data4n6.exhibits.dto.ExhibitResponse;
import com.data4n6.exhibits.dto.ExhibitSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExhibitService {

    private final ExhibitRepository exhibitRepository;
    private final ExhibitStatusRepository exhibitStatusRepository;
    private final EventRepository eventRepository;
    private final ExhibitMapper mapper;

    public List<ExhibitSummaryResponse> findAllByEvent(UUID eventId) {
        return exhibitRepository.findAllActiveByEvent(eventId).stream()
                .map(mapper::toSummaryResponse)
                .toList();
    }

    public ExhibitResponse findById(UUID id) {
        return exhibitRepository.findActiveById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Exhibit", id));
    }

    @Transactional
    public ExhibitResponse create(ExhibitRequest request) {
        Event event = eventRepository.findActiveById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", request.eventId()));

        ExhibitStatus status = exhibitStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("ExhibitStatus", request.statusId()));

        Exhibit exhibit = mapper.toEntity(request);
        exhibit.setEvent(event);
        exhibit.setStatus(status);
        exhibit.setCondition("INTACT");
        exhibit.setSequenceNumber(exhibitRepository.findMaxSequenceNumberByEvent(request.eventId()) + 1);

        return mapper.toResponse(exhibitRepository.save(exhibit));
    }

    @Transactional
    public ExhibitResponse update(UUID id, ExhibitRequest request) {
        Exhibit exhibit = exhibitRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exhibit", id));

        ExhibitStatus status = exhibitStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("ExhibitStatus", request.statusId()));

        exhibit.setStatus(status);
        exhibit.setDescription(request.description());
        exhibit.setMake(request.make());
        exhibit.setModel(request.model());
        exhibit.setSerialNumber(request.serialNumber());
        exhibit.setFieldLocation(request.fieldLocation());
        exhibit.setNotes(request.notes());

        return mapper.toResponse(exhibitRepository.save(exhibit));
    }

    @Transactional
    public void delete(UUID id) {
        Exhibit exhibit = exhibitRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exhibit", id));
        exhibit.softDelete();
        exhibitRepository.save(exhibit);
    }
}
