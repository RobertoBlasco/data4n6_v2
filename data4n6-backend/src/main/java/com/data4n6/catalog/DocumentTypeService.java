package com.data4n6.catalog;

import com.data4n6.catalog.dto.DocumentTypeRequest;
import com.data4n6.catalog.dto.DocumentTypeResponse;
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
public class DocumentTypeService {

    private final DocumentTypeRepository repository;

    public List<DocumentTypeResponse> findAll() {
        return repository.findByDeletedAtIsNullOrderByName()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DocumentTypeResponse create(DocumentTypeRequest req) {
        DocumentType dt = new DocumentType();
        dt.setId(UUID.randomUUID());
        applyRequest(req, dt);
        return toResponse(repository.save(dt));
    }

    @Transactional
    public DocumentTypeResponse update(UUID id, DocumentTypeRequest req) {
        DocumentType dt = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentType", id.toString()));
        applyRequest(req, dt);
        return toResponse(repository.save(dt));
    }

    @Transactional
    public void delete(UUID id) {
        DocumentType dt = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentType", id.toString()));
        dt.setDeletedAt(Instant.now());
        repository.save(dt);
    }

    private void applyRequest(DocumentTypeRequest req, DocumentType dt) {
        dt.setName(req.name());
        dt.setDescription(req.description());
        dt.setActive(req.active());
    }

    private DocumentTypeResponse toResponse(DocumentType dt) {
        return new DocumentTypeResponse(
                dt.getId(), dt.getName(), dt.getDescription(), dt.isActive(), dt.getDeletedAt());
    }
}
