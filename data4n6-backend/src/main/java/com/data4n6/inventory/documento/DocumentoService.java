package com.data4n6.inventory.documento;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import com.data4n6.catalog.DocumentType;
import com.data4n6.catalog.DocumentTypeRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.documento.dto.DocumentoRequest;
import com.data4n6.inventory.documento.dto.DocumentoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentoService {

    private final DocumentoRepository    repository;
    private final AppTableRepository     appTableRepository;
    private final DocumentTypeRepository documentTypeRepository;

    public List<DocumentoResponse> findByEntity(UUID appTableId, UUID recordId) {
        return repository
                .findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(appTableId, recordId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DocumentoResponse create(DocumentoRequest req) {
        AppTable appTable = appTableRepository.findById(req.appTableId())
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", req.appTableId().toString()));
        Documento doc = new Documento();
        doc.setAppTable(appTable);
        doc.setRecordId(req.recordId());
        if (req.documentTypeId() != null)
            documentTypeRepository.findById(req.documentTypeId()).ifPresent(doc::setDocumentType);
        doc.setFilename(req.filename());
        doc.setMimeType(req.mimeType());
        doc.setFilePath(req.filePath());
        doc.setDescription(req.description());
        return toResponse(repository.save(doc));
    }

    @Transactional
    public void delete(UUID id) {
        Documento doc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento", id.toString()));
        doc.softDelete();
        repository.save(doc);
    }

    private DocumentoResponse toResponse(Documento d) {
        DocumentType dt = d.getDocumentType();
        return new DocumentoResponse(
                d.getId(),
                d.getAppTable().getId(),
                d.getAppTable().getTableName(),
                d.getRecordId(),
                dt != null ? dt.getId()   : null,
                dt != null ? dt.getName() : null,
                d.getFilename(),
                d.getMimeType(),
                d.getFilePath(),
                d.getDescription(),
                d.getCreatedAt()
        );
    }
}
