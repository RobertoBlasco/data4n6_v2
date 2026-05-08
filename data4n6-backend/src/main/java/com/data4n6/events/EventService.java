package com.data4n6.events;

import com.data4n6.cases.Case;
import com.data4n6.cases.CaseRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.events.dto.EventRequest;
import com.data4n6.events.dto.EventResponse;
import com.data4n6.events.dto.EventSummaryResponse;
import com.data4n6.geography.AdminDivisions;
import com.data4n6.geography.AdminDivisionsRepository;
import com.data4n6.geography.Countries;
import com.data4n6.geography.CountriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final EventStatusRepository eventStatusRepository;
    private final CaseRepository caseRepository;
    private final CountriesRepository countriesRepository;
    private final AdminDivisionsRepository adminDivisionsRepository;
    private final EventMapper mapper;

    public List<EventSummaryResponse> findAllByCase(UUID caseId) {
        return eventRepository.findAllActiveByCase(caseId).stream()
                .map(mapper::toSummaryResponse)
                .toList();
    }

    public EventResponse findById(UUID id) {
        return eventRepository.findActiveById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    @Transactional
    public EventResponse create(EventRequest request) {
        Case parentCase = caseRepository.findActiveById(request.caseId())
                .orElseThrow(() -> new ResourceNotFoundException("Case", request.caseId()));

        EventStatus status = eventStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("EventStatus", request.statusId()));

        Event event = mapper.toEntity(request);
        event.setParentCase(parentCase);
        event.setStatus(status);
        resolveGeography(event, request);

        return mapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse update(UUID id, EventRequest request) {
        Event event = eventRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));

        EventStatus status = eventStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("EventStatus", request.statusId()));

        event.setStatus(status);
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setLocationAddress(request.locationAddress());
        event.setLocationCity(request.locationCity());
        event.setLocationCoordinates(request.locationCoordinates());
        event.setScheduledAt(request.scheduledAt());
        resolveGeography(event, request);

        return mapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public void delete(UUID id) {
        Event event = eventRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        event.softDelete();
        eventRepository.save(event);
    }

    private void resolveGeography(Event event, EventRequest request) {
        if (request.countryId() != null) {
            Countries country = countriesRepository.findById(request.countryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Country", request.countryId()));
            event.setCountry(country);
        } else {
            event.setCountry(null);
        }

        if (request.adminDivisionId() != null) {
            AdminDivisions division = adminDivisionsRepository.findById(request.adminDivisionId())
                    .orElseThrow(() -> new ResourceNotFoundException("AdminDivision", request.adminDivisionId()));
            event.setAdminDivision(division);
        } else {
            event.setAdminDivision(null);
        }
    }
}
