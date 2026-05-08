package com.data4n6.cases;

import com.data4n6.cases.dto.CaseRequest;
import com.data4n6.cases.dto.CaseResponse;
import com.data4n6.cases.dto.CaseSummaryResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseService {

    private final CaseRepository caseRepository;
    private final CaseStatusRepository caseStatusRepository;
    private final CaseOutcomeRepository caseOutcomeRepository;
    private final CaseMapper mapper;

    public List<CaseSummaryResponse> findAll() {
        return caseRepository.findAllActive().stream()
                .map(mapper::toSummaryResponse)
                .toList();
    }

    public CaseResponse findById(UUID id) {
        return caseRepository.findActiveById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Case", id));
    }

    @Transactional
    public CaseResponse create(CaseRequest request) {
        CaseStatus status = caseStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("CaseStatus", request.statusId()));

        Case c = mapper.toEntity(request);
        c.setCode(generateCode());
        c.setStatus(status);

        if (request.outcomeId() != null) {
            CaseOutcome outcome = caseOutcomeRepository.findById(request.outcomeId())
                    .orElseThrow(() -> new ResourceNotFoundException("CaseOutcome", request.outcomeId()));
            c.setOutcome(outcome);
        }

        return mapper.toResponse(caseRepository.save(c));
    }

    @Transactional
    public CaseResponse update(UUID id, CaseRequest request) {
        Case c = caseRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case", id));

        CaseStatus status = caseStatusRepository.findById(request.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("CaseStatus", request.statusId()));

        c.setTitle(request.title());
        c.setDescription(request.description());
        c.setStatus(status);
        c.setClassificationLevelId(request.classificationLevelId());
        c.setClosedDate(request.closedDate());
        c.setOutcomeNotes(request.outcomeNotes());
        c.setOutcomeDocumentId(request.outcomeDocumentId());
        c.setRetentionReviewDate(request.retentionReviewDate());
        c.setRetentionCategory(request.retentionCategory());

        if (request.outcomeId() != null) {
            CaseOutcome outcome = caseOutcomeRepository.findById(request.outcomeId())
                    .orElseThrow(() -> new ResourceNotFoundException("CaseOutcome", request.outcomeId()));
            c.setOutcome(outcome);
        } else {
            c.setOutcome(null);
        }

        return mapper.toResponse(caseRepository.save(c));
    }

    @Transactional
    public void delete(UUID id) {
        Case c = caseRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Case", id));
        c.softDelete();
        caseRepository.save(c);
    }

    private String generateCode() {
        String year = String.valueOf(Year.now().getValue()).substring(2);
        long count = caseRepository.count() + 1;
        return year + String.format("%03d", count);
    }
}
