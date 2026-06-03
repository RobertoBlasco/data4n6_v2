package com.data4n6.inventory.categoriarticulo.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.categoriarticulo.CategoriaArticulo;
import com.data4n6.inventory.categoriarticulo.dto.CategoriaArticuloRequest;
import com.data4n6.inventory.categoriarticulo.dto.CategoriaArticuloResponse;
import com.data4n6.inventory.categoriarticulo.repository.CategoriaArticuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaArticuloService {

    private static final String TABLE = "t200_articulos";

    private final CategoriaArticuloRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<CategoriaArticuloResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public CategoriaArticuloResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CategoriaArticulo", id));
    }

    @Transactional
    public CategoriaArticuloResponse create(CategoriaArticuloRequest request) {
        CategoriaArticulo categoria = mapper.toEntity(request);
        repository.save(categoria);
        metadataService.onCreate(categoria.getId(), TABLE);
        return mapper.toResponse(categoria);
    }

    @Transactional
    public CategoriaArticuloResponse update(UUID id, CategoriaArticuloRequest request) {
        CategoriaArticulo categoria = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CategoriaArticulo", id));
        mapper.update(request, categoria);
        repository.save(categoria);
        metadataService.onUpdate(categoria.getId());
        return mapper.toResponse(categoria);
    }

    @Transactional
    public void delete(UUID id) {
        CategoriaArticulo categoria = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CategoriaArticulo", id));
        categoria.softDelete();
        repository.save(categoria);
    }
}
