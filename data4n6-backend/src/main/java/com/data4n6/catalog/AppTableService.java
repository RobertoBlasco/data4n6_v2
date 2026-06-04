package com.data4n6.catalog;

import com.data4n6.catalog.dto.AppResponse;
import com.data4n6.catalog.dto.AppTableRequest;
import com.data4n6.catalog.dto.AppTableResponse;
import com.data4n6.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppTableService {

    private final AppTableRepository repository;
    private final AppRepository      appRepository;

    public List<AppTableResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public List<AppTableResponse> findBySeccion(String seccionMenu) {
        return repository.findBySeccionMenuOrderByOrdenMenu(seccionMenu)
                .stream().map(this::toResponse).toList();
    }

    public AppTableResponse findByTableName(String tableName) {
        return repository.findByTableName(tableName)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", tableName));
    }

    @Transactional
    public AppTableResponse findById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", id.toString()));
    }

    public AppTableResponse create(AppTableRequest req) {
        AppTable t = new AppTable();
        t.setId(UUID.randomUUID());
        applyRequest(req, t);
        return toResponse(repository.save(t));
    }

    @Transactional
    public AppTableResponse update(UUID id, AppTableRequest req) {
        AppTable t = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", id.toString()));
        applyRequest(req, t);
        return toResponse(repository.save(t));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("AppTable", id.toString());
        }
        repository.deleteById(id);
    }

    private void applyRequest(AppTableRequest req, AppTable t) {
        t.setTableName(req.tableName());
        t.setDisplayName(req.displayName());
        t.setDescription(req.description());
        t.setNombreSingular(req.nombreSingular());
        t.setNombrePlural(req.nombrePlural());
        t.setIcono(req.icono());
        t.setVistas(req.vistas() != null ? req.vistas() : "GRID");
        t.setEndpointBase(req.endpointBase());
        t.setSeccionMenu(req.seccionMenu());
        t.setOrdenMenu(req.ordenMenu());
        t.setFormFields(req.formFields());
        t.setDbSchema(req.dbSchema());
        if (req.applicationId() != null) {
            App app = appRepository.findById(req.applicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("App", req.applicationId().toString()));
            t.setApplication(app);
        } else {
            t.setApplication(null);
        }
    }

    private AppTableResponse toResponse(AppTable t) {
        App app = t.getApplication();
        AppResponse appResponse = app == null ? null :
                new AppResponse(app.getId(), app.getName(), app.getDisplayName(), app.getDescription(), app.getIcono());
        return new AppTableResponse(
                t.getId(),
                t.getTableName(),
                t.getDisplayName(),
                t.getDescription(),
                t.getNombreSingular(),
                t.getNombrePlural(),
                t.getIcono(),
                t.getVistas(),
                t.getEndpointBase(),
                t.getSeccionMenu(),
                t.getOrdenMenu(),
                t.getFormFields(),
                t.getDbSchema(),
                t.getFormRoute(),
                appResponse);
    }
}
