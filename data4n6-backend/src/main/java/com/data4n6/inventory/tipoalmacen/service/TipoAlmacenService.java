package com.data4n6.inventory.tipoalmacen.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.tipoalmacen.TipoAlmacen;
import com.data4n6.inventory.tipoalmacen.dto.TipoAlmacenRequest;
import com.data4n6.inventory.tipoalmacen.dto.TipoAlmacenResponse;
import com.data4n6.inventory.tipoalmacen.repository.TipoAlmacenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TipoAlmacenService {

    private static final String TABLE = "t200_almacenes";

    private final TipoAlmacenRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<TipoAlmacenResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public TipoAlmacenResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("TipoAlmacen", id));
    }

    @Transactional
    public TipoAlmacenResponse create(TipoAlmacenRequest request) {
        TipoAlmacen tipo = mapper.toEntity(request);
        repository.save(tipo);
        metadataService.onCreate(tipo.getId(), TABLE);
        return mapper.toResponse(tipo);
    }

    @Transactional
    public TipoAlmacenResponse update(UUID id, TipoAlmacenRequest request) {
        TipoAlmacen tipo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoAlmacen", id));
        mapper.update(request, tipo);
        repository.save(tipo);
        metadataService.onUpdate(tipo.getId());
        return mapper.toResponse(tipo);
    }

    @Transactional
    public void delete(UUID id) {
        TipoAlmacen tipo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoAlmacen", id));
        tipo.softDelete();
        repository.save(tipo);
    }
}
