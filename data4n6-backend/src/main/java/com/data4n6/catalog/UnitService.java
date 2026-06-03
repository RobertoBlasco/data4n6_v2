package com.data4n6.catalog;

import com.data4n6.catalog.dto.UnitRequest;
import com.data4n6.catalog.dto.UnitResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service("commonUnitService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnitService {

    private final UnitRepository repository;

    public List<UnitResponse> findAll() {
        return repository.findByDeletedAtIsNullOrderByName()
                .stream().map(this::toResponse).toList();
    }

    public List<UnitResponse> findForInventory() {
        return repository.findForInventory()
                .stream().map(this::toResponse).toList();
    }

    public List<UnitResponse> findForData4n6() {
        return repository.findForData4n6()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public UnitResponse create(UnitRequest req) {
        Unit u = new Unit();
        u.setId(UUID.randomUUID());
        applyRequest(req, u);
        return toResponse(repository.save(u));
    }

    @Transactional
    public UnitResponse update(UUID id, UnitRequest req) {
        Unit u = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id.toString()));
        applyRequest(req, u);
        return toResponse(repository.save(u));
    }

    @Transactional
    public void delete(UUID id) {
        Unit u = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", id.toString()));
        u.setDeletedAt(Instant.now());
        repository.save(u);
    }

    private void applyRequest(UnitRequest req, Unit u) {
        u.setCode(req.code());
        u.setName(req.name());
        u.setDescription(req.description());
        u.setActive(req.active());
        u.setForInventory(req.forInventory());
        u.setForData4n6(req.forData4n6());
    }

    private UnitResponse toResponse(Unit u) {
        return new UnitResponse(
                u.getId(), u.getCode(), u.getName(), u.getDescription(),
                u.isActive(), u.getDeletedAt(), u.isForInventory(), u.isForData4n6()
        );
    }
}
