package com.data4n6.catalog;

import com.data4n6.catalog.dto.DocRequest;
import com.data4n6.catalog.dto.DocResponse;
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
public class DocService {

    private final DocRepository repository;

    public List<DocResponse> findAll() {
        return repository.findByDeletedAtIsNullOrderByDescription()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DocResponse create(DocRequest req) {
        Doc doc = new Doc();
        doc.setId(UUID.randomUUID());
        applyRequest(req, doc);
        return toResponse(repository.save(doc));
    }

    @Transactional
    public DocResponse update(UUID id, DocRequest req) {
        Doc doc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doc", id.toString()));
        applyRequest(req, doc);
        return toResponse(repository.save(doc));
    }

    @Transactional
    public void delete(UUID id) {
        Doc doc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doc", id.toString()));
        doc.setDeletedAt(Instant.now());
        repository.save(doc);
    }

    private void applyRequest(DocRequest req, Doc doc) {
        doc.setDescription(req.description());
        doc.setActive(req.active());
    }

    private DocResponse toResponse(Doc doc) {
        return new DocResponse(doc.getId(), doc.getDescription(), doc.isActive(), doc.getDeletedAt());
    }
}
