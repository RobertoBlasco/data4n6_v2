package com.data4n6.inventory.tipomaterial.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.tipomaterial.TipoMaterial;
import com.data4n6.inventory.tipomaterial.dto.TipoMaterialRequest;
import com.data4n6.inventory.tipomaterial.dto.TipoMaterialResponse;
import com.data4n6.inventory.tipomaterial.repository.TipoMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TipoMaterialService {

    private static final String TABLE = "t200_materiales";

    private final TipoMaterialRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<TipoMaterialResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public TipoMaterialResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", id));
    }

    @Transactional
    public TipoMaterialResponse create(TipoMaterialRequest request) {
        TipoMaterial material = mapper.toEntity(request);
        repository.save(material);
        metadataService.onCreate(material.getId(), TABLE);
        return mapper.toResponse(material);
    }

    @Transactional
    public TipoMaterialResponse update(UUID id, TipoMaterialRequest request) {
        TipoMaterial material = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", id));
        mapper.update(request, material);
        repository.save(material);
        metadataService.onUpdate(material.getId());
        return mapper.toResponse(material);
    }

    @Transactional
    public void delete(UUID id) {
        TipoMaterial material = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", id));
        material.softDelete();
        repository.save(material);
    }
}
