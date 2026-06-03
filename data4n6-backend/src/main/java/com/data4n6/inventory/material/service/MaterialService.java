package com.data4n6.inventory.material.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.marca.repository.T200MarcaRepository;
import com.data4n6.inventory.modelo.repository.ModeloRepository;
import com.data4n6.inventory.material.Material;
import com.data4n6.inventory.material.dto.MaterialRequest;
import com.data4n6.inventory.material.dto.MaterialResponse;
import com.data4n6.inventory.material.repository.MaterialRepository;
import com.data4n6.inventory.tipomaterial.repository.TipoMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialService {

    private static final String TABLE = "t100_materiales";

    private final MaterialRepository repository;
    private final TipoMaterialRepository tipoMaterialRepository;
    private final T200MarcaRepository marcaRepository;
    private final ModeloRepository modeloRepository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<MaterialResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public MaterialResponse findById(UUID id) {
        return repository.findActiveById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
    }

    @Transactional
    public MaterialResponse create(MaterialRequest request) {
        Material material = new Material();
        applyRequest(material, request);
        repository.save(material);
        metadataService.onCreate(material.getId(), TABLE);
        return mapper.toResponse(material);
    }

    @Transactional
    public MaterialResponse update(UUID id, MaterialRequest request) {
        Material material = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
        applyRequest(material, request);
        repository.save(material);
        metadataService.onUpdate(material.getId());
        return mapper.toResponse(material);
    }

    @Transactional
    public void delete(UUID id) {
        Material material = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
        material.softDelete();
        repository.save(material);
    }

    private void applyRequest(Material material, MaterialRequest req) {
        material.setTipoMaterial(tipoMaterialRepository.findById(req.tipoMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", req.tipoMaterialId())));
        material.setMarca(req.marcaId() == null ? null :
                marcaRepository.findById(req.marcaId())
                        .orElseThrow(() -> new ResourceNotFoundException("T200Marca", req.marcaId())));
        material.setModelo(req.modeloId() == null ? null :
                modeloRepository.findById(req.modeloId())
                        .orElseThrow(() -> new ResourceNotFoundException("Modelo", req.modeloId())));
    }
}
