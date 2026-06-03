package com.data4n6.inventory.nota;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.nota.dto.NotaRequest;
import com.data4n6.inventory.nota.dto.NotaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotaService {

    private final NotaRepository    repository;
    private final AppTableRepository appTableRepository;

    public List<NotaResponse> findByEntity(UUID appTableId, UUID recordId) {
        return repository
                .findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(appTableId, recordId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public NotaResponse create(NotaRequest req) {
        AppTable appTable = appTableRepository.findById(req.appTableId())
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", req.appTableId().toString()));
        Nota nota = new Nota();
        nota.setAppTable(appTable);
        nota.setRecordId(req.recordId());
        nota.setBody(req.body());
        return toResponse(repository.save(nota));
    }

    @Transactional
    public void delete(UUID id) {
        Nota nota = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota", id.toString()));
        nota.softDelete();
        repository.save(nota);
    }

    private NotaResponse toResponse(Nota n) {
        return new NotaResponse(
                n.getId(),
                n.getAppTable().getId(),
                n.getAppTable().getTableName(),
                n.getRecordId(),
                n.getBody(),
                n.getCreatedAt()
        );
    }
}
