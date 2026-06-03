package com.data4n6.inventory.proveedor.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.proveedor.Proveedor;
import com.data4n6.inventory.proveedor.dto.ProveedorRequest;
import com.data4n6.inventory.proveedor.dto.ProveedorResponse;
import com.data4n6.inventory.proveedor.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProveedorService {

    private static final String TABLE = "t200_proveedores";

    private final ProveedorRepository repository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<ProveedorResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public ProveedorResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
    }

    @Transactional
    public ProveedorResponse create(ProveedorRequest request) {
        Proveedor entity = new Proveedor();
        apply(entity, request);
        repository.save(entity);
        metadataService.onCreate(entity.getId(), TABLE);
        return mapper.toResponse(entity);
    }

    @Transactional
    public ProveedorResponse update(UUID id, ProveedorRequest request) {
        Proveedor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
        apply(entity, request);
        repository.save(entity);
        metadataService.onUpdate(entity.getId());
        return mapper.toResponse(entity);
    }

    @Transactional
    public void delete(UUID id) {
        Proveedor entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", id));
        entity.softDelete();
        repository.save(entity);
    }

    private void apply(Proveedor entity, ProveedorRequest req) {
        entity.setNombre(req.nombre());
        entity.setNif(req.nif());
        entity.setContacto(req.contacto());
        entity.setTelefono(req.telefono());
        entity.setEmail(req.email());
        entity.setDireccion(req.direccion());
        entity.setNotas(req.notas());
    }
}
