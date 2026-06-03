package com.data4n6.inventory.modelo.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.marca.repository.T200MarcaRepository;
import com.data4n6.inventory.materialmarca.repository.MaterialMarcaRepository;
import com.data4n6.inventory.modelo.Modelo;
import com.data4n6.inventory.modelo.dto.ModeloRequest;
import com.data4n6.inventory.modelo.dto.ModeloResponse;
import com.data4n6.inventory.modelo.repository.ModeloRepository;
import com.data4n6.inventory.tipomaterial.repository.TipoMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModeloService {

    private static final String TABLE = "t200_modelos";

    private final ModeloRepository repository;
    private final TipoMaterialRepository tipoMaterialRepository;
    private final T200MarcaRepository marcaRepository;
    private final MaterialMarcaRepository materialMarcaRepository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<ModeloResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public List<ModeloResponse> findByMarca(UUID marcaId) {
        return repository.findActiveByMarca(marcaId).stream().map(mapper::toResponse).toList();
    }

    public ModeloResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo", id));
    }

    @Transactional
    public ModeloResponse create(ModeloRequest request) {
        Modelo modelo = new Modelo();
        applyRequest(modelo, request);
        repository.save(modelo);
        metadataService.onCreate(modelo.getId(), TABLE);
        return mapper.toResponse(modelo);
    }

    @Transactional
    public ModeloResponse update(UUID id, ModeloRequest request) {
        Modelo modelo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo", id));
        applyRequest(modelo, request);
        repository.save(modelo);
        metadataService.onUpdate(modelo.getId());
        return mapper.toResponse(modelo);
    }

    @Transactional
    public void delete(UUID id) {
        Modelo modelo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo", id));
        modelo.softDelete();
        repository.save(modelo);
    }

    private void applyRequest(Modelo modelo, ModeloRequest req) {
        modelo.setTipoMaterial(tipoMaterialRepository.findById(req.tipoMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException("TipoMaterial", req.tipoMaterialId())));
        modelo.setMarca(marcaRepository.findById(req.marcaId())
                .orElseThrow(() -> new ResourceNotFoundException("T200Marca", req.marcaId())));
        materialMarcaRepository.findActiveByTipoMaterialAndMarca(req.tipoMaterialId(), req.marcaId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "The combination of tipoMaterial and marca is not registered in t250_materiales_marcas"));
        modelo.setDescription(req.description());
    }
}
