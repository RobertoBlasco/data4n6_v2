package com.data4n6.catalog;

import com.data4n6.catalog.dto.AgentRequest;
import com.data4n6.catalog.dto.AgentResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service("commonAgentService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AgentService {

    private final AgentRepository repository;
    private final UnitRepository  unitRepository;

    public List<AgentResponse> findAll(UUID unitId) {
        var agents = unitId != null
                ? repository.findByUnit_IdAndDeletedAtIsNullOrderByLastNameAscFirstNameAsc(unitId)
                : repository.findByDeletedAtIsNullOrderByLastNameAscFirstNameAsc();
        return agents.stream().map(this::toResponse).toList();
    }

    public AgentResponse findById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", id.toString()));
    }

    @Transactional
    public AgentResponse create(AgentRequest req) {
        Agent a = new Agent();
        a.setId(UUID.randomUUID());
        applyRequest(req, a);
        return toResponse(repository.save(a));
    }

    @Transactional
    public AgentResponse update(UUID id, AgentRequest req) {
        Agent a = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", id.toString()));
        applyRequest(req, a);
        return toResponse(repository.save(a));
    }

    @Transactional
    public void delete(UUID id) {
        Agent a = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", id.toString()));
        a.setDeletedAt(Instant.now());
        repository.save(a);
    }

    private void applyRequest(AgentRequest req, Agent a) {
        a.setCallSign(req.callSign());
        a.setFirstName(req.firstName());
        a.setLastName(req.lastName());
        a.setActive(req.active());
        if (req.unitId() != null) {
            unitRepository.findById(req.unitId()).ifPresent(a::setUnit);
        } else {
            a.setUnit(null);
        }
    }

    private AgentResponse toResponse(Agent a) {
        return new AgentResponse(
                a.getId(),
                a.getCallSign(),
                a.getFirstName(),
                a.getLastName(),
                a.getUnit() != null ? a.getUnit().getId()   : null,
                a.getUnit() != null ? a.getUnit().getName() : null,
                a.isActive(),
                a.getDeletedAt()
        );
    }
}
