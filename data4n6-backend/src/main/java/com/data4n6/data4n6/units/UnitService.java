package com.data4n6.data4n6.units;

import com.data4n6.data4n6.cases.Case;
import com.data4n6.data4n6.cases.CaseMapper;
import com.data4n6.data4n6.cases.dto.CaseSummaryResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.data4n6.persons.PersonService;
import com.data4n6.data4n6.persons.dto.PersonSummaryResponse;
import com.data4n6.data4n6.units.dto.UnitRequest;
import com.data4n6.data4n6.units.dto.UnitResponse;
import com.data4n6.data4n6.units.dto.UnitStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitService {

    private final UnitRepository repository;
    private final UnitMapper mapper;
    private final CaseMapper caseMapper;
    private final PersonService personService;

    public List<UnitResponse> findAll() {
        return repository.findAllActive().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public UnitResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id));
    }

    @Transactional
    public UnitResponse create(UnitRequest request) {
        Unit unit = mapper.toEntity(request);
        unit.setParent(resolveParent(request.parentId()));
        return mapper.toResponse(repository.save(unit));
    }

    @Transactional
    public UnitResponse update(UUID id, UnitRequest request) {
        Unit unit = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id));

        unit.setParent(resolveParent(request.parentId()));
        unit.setCode(request.code());
        unit.setName(request.name());
        unit.setDescription(request.description());
        unit.setActive(request.active());

        return mapper.toResponse(repository.save(unit));
    }

    @Transactional
    public void delete(UUID id) {
        Unit unit = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id));
        unit.softDelete();
        repository.save(unit);
    }

    public List<CaseSummaryResponse> findCasesByUnit(UUID unitId) {
        repository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", unitId));
        return repository.findCasesByUnitId(unitId).stream()
                .map(caseMapper::toSummaryResponse)
                .toList();
    }

    public UnitStatsResponse getStatsByUnit(UUID unitId) {
        repository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", unitId));
        List<Case> cases = repository.findCasesByUnitId(unitId);
        Map<com.data4n6.data4n6.cases.CaseStatus, Long> grouped = cases.stream()
                .collect(Collectors.groupingBy(Case::getStatus, Collectors.counting()));
        List<UnitStatsResponse.StatusCount> byStatus = grouped.entrySet().stream()
                .map(e -> new UnitStatsResponse.StatusCount(
                        e.getKey().getId(), e.getKey().getName(),
                        e.getKey().getColor(), e.getValue()))
                .sorted(Comparator.comparing(UnitStatsResponse.StatusCount::name))
                .toList();
        return new UnitStatsResponse(cases.size(), byStatus);
    }

    public List<PersonSummaryResponse> findPersonsByUnit(UUID unitId) {
        repository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", unitId));
        return personService.findByEntity("t200_units", unitId);
    }

    private Unit resolveParent(UUID parentId) {
        if (parentId == null) return null;
        return repository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", parentId));
    }
}
