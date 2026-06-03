package com.data4n6.catalog;

import com.data4n6.catalog.dto.PictureTypeRequest;
import com.data4n6.catalog.dto.PictureTypeResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PictureTypeService {

    private final PictureTypeRepository repository;

    public List<PictureTypeResponse> findAll() {
        return repository.findByDeletedAtIsNullOrderByName()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public PictureTypeResponse create(PictureTypeRequest req) {
        PictureType pt = new PictureType();
        pt.setId(UUID.randomUUID());
        applyRequest(req, pt);
        return toResponse(repository.save(pt));
    }

    @Transactional
    public PictureTypeResponse update(UUID id, PictureTypeRequest req) {
        PictureType pt = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PictureType", id.toString()));
        applyRequest(req, pt);
        return toResponse(repository.save(pt));
    }

    @Transactional
    public void delete(UUID id) {
        PictureType pt = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PictureType", id.toString()));
        pt.setDeletedAt(Instant.now());
        repository.save(pt);
    }

    private void applyRequest(PictureTypeRequest req, PictureType pt) {
        pt.setName(req.name());
        pt.setDescription(req.description());
        pt.setActive(req.active());
    }

    private PictureTypeResponse toResponse(PictureType pt) {
        return new PictureTypeResponse(
                pt.getId(), pt.getName(), pt.getDescription(), pt.isActive(), pt.getDeletedAt());
    }
}
