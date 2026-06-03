package com.data4n6.data4n6.evidence;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.data4n6.events.Event;
import com.data4n6.data4n6.events.EventRepository;
import com.data4n6.data4n6.evidence.dto.EvidenceRequest;
import com.data4n6.data4n6.evidence.dto.EvidenceResponse;
import com.data4n6.data4n6.evidence.dto.EvidenceSummaryResponse;
import com.data4n6.data4n6.exhibits.Exhibit;
import com.data4n6.data4n6.exhibits.ExhibitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final EvidenceStatusRepository evidenceStatusRepository;
    private final EventRepository eventRepository;
    private final ExhibitRepository exhibitRepository;
    private final EvidenceMapper mapper;

    public List<EvidenceSummaryResponse> findAllByEvent(UUID eventId) {
        return evidenceRepository.findAllActiveByEvent(eventId).stream()
                .map(mapper::toSummaryResponse)
                .toList();
    }

    public List<EvidenceSummaryResponse> findAllByExhibit(UUID exhibitId) {
        return evidenceRepository.findAllActiveByExhibit(exhibitId).stream()
                .map(mapper::toSummaryResponse)
                .toList();
    }

    public EvidenceResponse findById(UUID id) {
        return evidenceRepository.findActiveById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence", id));
    }

    @Transactional
    public EvidenceResponse create(EvidenceRequest request) {
        Event event = eventRepository.findActiveById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", request.eventId()));

        EvidenceStatus status = evidenceStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("EvidenceStatus", request.statusId()));

        Evidence evidence = mapper.toEntity(request);
        evidence.setEvent(event);
        evidence.setStatus(status);
        evidence.setCondition("INTACT");
        evidence.setSequenceNumber(evidenceRepository.findMaxSequenceNumberByEvent(request.eventId()) + 1);

        if (request.exhibitId() != null) {
            Exhibit exhibit = exhibitRepository.findActiveById(request.exhibitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exhibit", request.exhibitId()));
            evidence.setExhibit(exhibit);
        }

        return mapper.toResponse(evidenceRepository.save(evidence));
    }

    @Transactional
    public EvidenceResponse update(UUID id, EvidenceRequest request) {
        Evidence evidence = evidenceRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence", id));

        EvidenceStatus status = evidenceStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("EvidenceStatus", request.statusId()));

        evidence.setStatus(status);
        evidence.setDescription(request.description());
        evidence.setHashMd5(request.hashMd5());
        evidence.setHashSha256(request.hashSha256());
        evidence.setSizeBytes(request.sizeBytes());
        evidence.setNotes(request.notes());

        if (request.exhibitId() != null) {
            Exhibit exhibit = exhibitRepository.findActiveById(request.exhibitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exhibit", request.exhibitId()));
            evidence.setExhibit(exhibit);
        } else {
            evidence.setExhibit(null);
        }

        return mapper.toResponse(evidenceRepository.save(evidence));
    }

    @Transactional
    public void delete(UUID id) {
        Evidence evidence = evidenceRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence", id));
        evidence.softDelete();
        evidenceRepository.save(evidence);
    }
}
