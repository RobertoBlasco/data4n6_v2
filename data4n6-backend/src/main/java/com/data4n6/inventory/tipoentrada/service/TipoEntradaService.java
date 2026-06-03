package com.data4n6.inventory.tipoentrada.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.tipoentrada.TipoEntrada;
import com.data4n6.inventory.tipoentrada.dto.TipoEntradaRequest;
import com.data4n6.inventory.tipoentrada.dto.TipoEntradaResponse;
import com.data4n6.inventory.tipoentrada.repository.TipoEntradaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TipoEntradaService {

    private static final String TABLE = "t200_entradas_almacen";

    private final TipoEntradaRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<TipoEntradaResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public TipoEntradaResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("TipoEntrada", id));
    }

    @Transactional
    public TipoEntradaResponse create(TipoEntradaRequest request) {
        TipoEntrada entity = new TipoEntrada();
        apply(entity, request);
        repository.save(entity);
        metadataService.onCreate(entity.getId(), TABLE);
        return mapper.toResponse(entity);
    }

    @Transactional
    public TipoEntradaResponse update(UUID id, TipoEntradaRequest request) {
        TipoEntrada entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoEntrada", id));
        apply(entity, request);
        repository.save(entity);
        metadataService.onUpdate(entity.getId());
        return mapper.toResponse(entity);
    }

    @Transactional
    public void delete(UUID id) {
        TipoEntrada entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoEntrada", id));
        entity.softDelete();
        repository.save(entity);
    }

    private void apply(TipoEntrada entity, TipoEntradaRequest req) {
        entity.setNombre(req.nombre());
        entity.setDescripcionCorta(req.descripcionCorta());
        entity.setDescripcion(req.descripcion());
    }
}
