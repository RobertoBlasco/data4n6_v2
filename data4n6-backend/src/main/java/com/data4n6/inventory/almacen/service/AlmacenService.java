package com.data4n6.inventory.almacen.service;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.InventoryMapper;
import com.data4n6.inventory.MetadataService;
import com.data4n6.inventory.almacen.Almacen;
import com.data4n6.inventory.almacen.dto.AlmacenRequest;
import com.data4n6.inventory.almacen.dto.AlmacenResponse;
import com.data4n6.inventory.almacen.repository.AlmacenRepository;
import com.data4n6.inventory.tipoalmacen.repository.TipoAlmacenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlmacenService {

    private static final String TABLE = "t100_almacenes";

    private final AlmacenRepository repository;
    private final TipoAlmacenRepository tipoAlmacenRepository;
    private final InventoryMapper mapper;
    private final MetadataService metadataService;

    public List<AlmacenResponse> findAll() {
        return repository.findAllActive().stream().map(mapper::toResponse).toList();
    }

    public AlmacenResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Almacen", id));
    }

    @Transactional
    public AlmacenResponse create(AlmacenRequest request) {
        Almacen almacen = mapper.toEntity(request);
        applyRequest(almacen, request);
        repository.save(almacen);
        metadataService.onCreate(almacen.getId(), TABLE);
        return mapper.toResponse(almacen);
    }

    @Transactional
    public AlmacenResponse update(UUID id, AlmacenRequest request) {
        Almacen almacen = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacen", id));
        mapper.update(request, almacen);
        applyRequest(almacen, request);
        repository.save(almacen);
        metadataService.onUpdate(almacen.getId());
        return mapper.toResponse(almacen);
    }

    @Transactional
    public void delete(UUID id) {
        Almacen almacen = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Almacen", id));
        almacen.softDelete();
        repository.save(almacen);
    }

    private void applyRequest(Almacen almacen, AlmacenRequest req) {
        almacen.setTipoAlmacen(req.tipoAlmacenId() == null ? null :
                tipoAlmacenRepository.findById(req.tipoAlmacenId())
                        .orElseThrow(() -> new ResourceNotFoundException("TipoAlmacen", req.tipoAlmacenId())));
    }
}
