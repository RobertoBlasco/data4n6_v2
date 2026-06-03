package com.data4n6.inventory.marca.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.marca.T200Marca;
import com.data4n6.inventory.marca.dto.T200MarcaRequest;
import com.data4n6.inventory.marca.dto.T200MarcaResponse;
import com.data4n6.inventory.marca.repository.T200MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class T200MarcaService {

    private static final String TABLE = "t200_marcas";

    private final T200MarcaRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<T200MarcaResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public T200MarcaResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("T200Marca", id));
    }

    @Transactional
    public T200MarcaResponse create(T200MarcaRequest request) {
        T200Marca marca = mapper.toEntity(request);
        repository.save(marca);
        metadataService.onCreate(marca.getId(), TABLE);
        return mapper.toResponse(marca);
    }

    @Transactional
    public T200MarcaResponse update(UUID id, T200MarcaRequest request) {
        T200Marca marca = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("T200Marca", id));
        mapper.update(request, marca);
        repository.save(marca);
        metadataService.onUpdate(marca.getId());
        return mapper.toResponse(marca);
    }

    @Transactional
    public void delete(UUID id) {
        T200Marca marca = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("T200Marca", id));
        marca.softDelete();
        repository.save(marca);
    }
}
