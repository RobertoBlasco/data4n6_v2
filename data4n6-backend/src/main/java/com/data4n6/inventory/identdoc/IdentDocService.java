package com.data4n6.inventory.identdoc;

import com.data4n6.catalog.AppTableRepository;
import com.data4n6.catalog.DocRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.identdoc.dto.IdentDocRequest;
import com.data4n6.inventory.identdoc.dto.IdentDocResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IdentDocService {

    private final IdentDocRepository repository;
    private final AppTableRepository appTableRepository;
    private final DocRepository      docRepository;

    public List<IdentDocResponse> findByEntity(UUID appTableId, UUID recordId) {
        return repository
                .findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(appTableId, recordId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public IdentDocResponse create(IdentDocRequest req) {
        var appTable = appTableRepository.findById(req.appTableId())
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", req.appTableId().toString()));
        IdentDoc doc = new IdentDoc();
        doc.setAppTable(appTable);
        doc.setRecordId(req.recordId());
        if (req.docTypeId() != null)
            docRepository.findById(req.docTypeId()).ifPresent(doc::setDocType);
        doc.setNumero(req.numero());
        doc.setFechaCaducidad(req.fechaCaducidad());
        return toResponse(repository.save(doc));
    }

    @Transactional
    public void delete(UUID id) {
        IdentDoc doc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IdentDoc", id.toString()));
        doc.softDelete();
        repository.save(doc);
    }

    private IdentDocResponse toResponse(IdentDoc d) {
        var dt = d.getDocType();
        return new IdentDocResponse(
                d.getId(),
                d.getAppTable().getId(),
                d.getAppTable().getTableName(),
                d.getRecordId(),
                dt != null ? dt.getId()          : null,
                dt != null ? dt.getDescription() : null,
                d.getNumero(),
                d.getFechaCaducidad(),
                d.getCreatedAt()
        );
    }
}
