package com.data4n6.inventory.materialmarca.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.marca.repository.T200MarcaRepository;
import com.data4n6.inventory.materialmarca.MaterialMarca;
import com.data4n6.inventory.materialmarca.dto.MaterialMarcaRequest;
import com.data4n6.inventory.materialmarca.dto.MaterialMarcaResponse;
import com.data4n6.inventory.materialmarca.repository.MaterialMarcaRepository;
import com.data4n6.inventory.tipomaterial.repository.TipoMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialMarcaService {

    private static final String TABLE = "t250_materiales_marcas";

    private final MaterialMarcaRepository repository;
    private final TipoMaterialRepository tipoMaterialRepository;
    private final T200MarcaRepository marcaRepository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<MaterialMarcaResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public List<MaterialMarcaResponse> findByMarca(UUID marcaId) {
        return repository.findActiveByMarca(marcaId).stream().map(mapper::toResponse).toList();
    }

    public List<MaterialMarcaResponse> findByTipoMaterial(UUID tipoMaterialId) {
        return repository.findActiveByTipoMaterial(tipoMaterialId).stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public MaterialMarcaResponse create(MaterialMarcaRequest request) {
        MaterialMarca entity = new MaterialMarca();
        applyRequest(entity, request);
        repository.save(entity);
        metadataService.onCreate(entity.getId(), TABLE);
        return mapper.toResponse(entity);
    }

    @Transactional
    public void delete(UUID id) {
        MaterialMarca entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaterialMarca", id));
        entity.softDelete();
        repository.save(entity);
    }

    private void applyRequest(MaterialMarca entity, MaterialMarcaRequest req) {
        entity.setTipoMaterial(tipoMaterialRepository.findById(req.tipoMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", req.tipoMaterialId())));
        entity.setMarca(marcaRepository.findById(req.marcaId())
                .orElseThrow(() -> new ResourceNotFoundException("T200Marca", req.marcaId())));
    }
}
