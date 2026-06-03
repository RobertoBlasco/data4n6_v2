package com.data4n6.catalog;

import com.data4n6.catalog.dto.TableFieldRequest;
import com.data4n6.catalog.dto.TableFieldResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableFieldService {

    private final TableFieldRepository repository;
    private final AppTableRepository   appTableRepository;

    public List<TableFieldResponse> findByAppTable(UUID appTableId) {
        return repository.findByAppTable_IdOrderByOrden(appTableId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public TableFieldResponse create(TableFieldRequest req) {
        TableField f = new TableField();
        f.setId(UUID.randomUUID());
        applyRequest(req, f);
        return toResponse(repository.save(f));
    }

    @Transactional
    public TableFieldResponse update(UUID id, TableFieldRequest req) {
        TableField f = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TableField", id.toString()));
        applyRequest(req, f);
        return toResponse(repository.save(f));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("TableField", id.toString());
        }
        repository.deleteById(id);
    }

    private void applyRequest(TableFieldRequest req, TableField f) {
        AppTable appTable = appTableRepository.findById(req.appTableId())
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", req.appTableId().toString()));
        f.setAppTable(appTable);
        f.setFieldName(req.fieldName());
        f.setDisplayName(req.displayName());
        f.setFieldType(req.fieldType() != null ? req.fieldType() : "text");
        f.setRequired(req.required());
        f.setDefaultValue(req.defaultValue());
        f.setPlaceholder(req.placeholder());
        f.setEndpoint(req.endpoint());
        f.setVisibleInGrid(req.visibleInGrid());
        f.setVisibleInForm(req.visibleInForm());
        f.setOrden(req.orden());
        f.setGridWidth(req.gridWidth());
        f.setGridAlign(req.gridAlign());
    }

    private TableFieldResponse toResponse(TableField f) {
        return new TableFieldResponse(
                f.getId(),
                f.getAppTable().getId(),
                f.getFieldName(),
                f.getDisplayName(),
                f.getFieldType(),
                f.isRequired(),
                f.getDefaultValue(),
                f.getPlaceholder(),
                f.getEndpoint(),
                f.isVisibleInGrid(),
                f.isVisibleInForm(),
                f.getOrden(),
                f.getGridWidth(),
                f.getGridAlign());
    }
}
