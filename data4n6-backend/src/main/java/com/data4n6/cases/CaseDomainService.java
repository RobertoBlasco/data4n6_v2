package com.data4n6.cases;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.cases.dto.CaseDomainRequest;
import com.data4n6.cases.dto.CaseDomainResponse;
import com.data4n6.cases.dto.CaseSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaseDomainService {

    private final CaseDomainRepository repository;
    private final CaseRepository caseRepository;
    private final CaseMapper mapper;

    public List<CaseDomainResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CaseDomainResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CaseDomain", id));
    }

    @Transactional
    public CaseDomainResponse create(CaseDomainRequest request) {
        CaseDomain domain = mapper.toEntity(request);
        domain.setParent(resolveParent(request.parentId()));
        return mapper.toResponse(repository.save(domain));
    }

    @Transactional
    public CaseDomainResponse update(UUID id, CaseDomainRequest request) {
        CaseDomain domain = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseDomain", id));

        domain.setParent(resolveParent(request.parentId()));
        domain.setName(request.name());
        domain.setDescription(request.description());
        domain.setDisplayOrder(request.displayOrder());
        domain.setActive(request.active());

        return mapper.toResponse(repository.save(domain));
    }

    public List<CaseSummaryResponse> findCasesByDomain(UUID domainId) {
        if (!repository.existsById(domainId)) {
            throw new ResourceNotFoundException("CaseDomain", domainId);
        }
        return caseRepository.findAllActiveByDomain(domainId).stream()
                .map(mapper::toSummaryResponse)
                .toList();
    }

    private CaseDomain resolveParent(UUID parentId) {
        if (parentId == null) return null;
        return repository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("CaseDomain", parentId));
    }

    @Transactional
    public void delete(UUID id) {
        CaseDomain domain = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CaseDomain", id));
        domain.softDelete();
        repository.save(domain);
    }
}
