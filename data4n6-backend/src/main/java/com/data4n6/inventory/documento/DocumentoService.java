package com.data4n6.inventory.documento;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import com.data4n6.catalog.DocumentType;
import com.data4n6.catalog.DocumentTypeRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.documento.dto.DocumentoResponse;
import com.data4n6.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentoService {

    private final DocumentoRepository    repository;
    private final AppTableRepository     appTableRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final StorageService         storageService;

    public List<DocumentoResponse> findByEntity(UUID appTableId, UUID recordId) {
        return repository
                .findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(appTableId, recordId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DocumentoResponse upload(UUID appTableId, UUID recordId,
                                    UUID documentTypeId, String description,
                                    MultipartFile file) {
        AppTable appTable = appTableRepository.findById(appTableId)
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", appTableId.toString()));

        String key = storageService.upload(file, "documents");
        String url = storageService.getPublicUrl(key);
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";

        Documento doc = new Documento();
        doc.setAppTable(appTable);
        doc.setRecordId(recordId);
        doc.setTitle(originalName);
        doc.setOriginalFilename(originalName);
        doc.setStoredFilename(key);
        doc.setMimeType(file.getContentType());
        doc.setFileSizeBytes(file.getSize());
        doc.setFilePath(url);
        doc.setDescription(description);

        if (documentTypeId != null)
            documentTypeRepository.findById(documentTypeId).ifPresent(doc::setDocumentType);

        return toResponse(repository.save(doc));
    }

    @Transactional
    public void delete(UUID id) {
        Documento doc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Documento", id.toString()));
        storageService.delete(doc.getStoredFilename());
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
                d.getTitle(),
                d.getOriginalFilename(),
                d.getMimeType(),
                d.getFilePath(),
                d.getDescription(),
                d.getFileSizeBytes(),
                d.getCreatedAt()
        );
    }
}
