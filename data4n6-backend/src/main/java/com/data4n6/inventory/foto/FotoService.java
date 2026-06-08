package com.data4n6.inventory.foto;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import com.data4n6.catalog.PictureType;
import com.data4n6.catalog.PictureTypeRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.foto.dto.FotoResponse;
import com.data4n6.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FotoService {

    private final FotoRepository        repository;
    private final AppTableRepository    appTableRepository;
    private final PictureTypeRepository pictureTypeRepository;
    private final StorageService        storageService;

    public List<FotoResponse> findByEntity(UUID appTableId, UUID recordId) {
        return repository
                .findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(appTableId, recordId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public FotoResponse upload(UUID appTableId, UUID recordId, UUID pictureTypeId,
                               boolean esPrincipal, String caption, MultipartFile file) {
        AppTable appTable = appTableRepository.findById(appTableId)
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", appTableId.toString()));

        String key = storageService.upload(file, "pictures");
        String url = storageService.getPublicUrl(key);

        Foto foto = new Foto();
        foto.setAppTable(appTable);
        foto.setRecordId(recordId);
        foto.setOriginalFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        foto.setStoredFilename(key);
        foto.setMimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        foto.setFileSizeBytes(file.getSize());
        foto.setFilePath(url);
        foto.setEsPrincipal(esPrincipal);
        foto.setCaption(caption);

        if (pictureTypeId != null)
            pictureTypeRepository.findById(pictureTypeId).ifPresent(foto::setPictureType);

        return toResponse(repository.save(foto));
    }

    @Transactional
    public FotoResponse setPrincipal(UUID id) {
        Foto foto = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Foto", id.toString()));
        repository.findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                foto.getAppTable().getId(), foto.getRecordId())
                .forEach(f -> {
                    boolean shouldBePrincipal = f.getId().equals(id);
                    if (f.isEsPrincipal() != shouldBePrincipal) {
                        f.setEsPrincipal(shouldBePrincipal);
                        repository.save(f);
                    }
                });
        return toResponse(repository.findById(id).orElseThrow());
    }

    @Transactional
    public void delete(UUID id) {
        Foto foto = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Foto", id.toString()));
        storageService.delete(foto.getStoredFilename());
        foto.softDelete();
        repository.save(foto);
    }

    private FotoResponse toResponse(Foto f) {
        PictureType pt = f.getPictureType();
        return new FotoResponse(
                f.getId(),
                f.getAppTable().getId(),
                f.getAppTable().getTableName(),
                f.getRecordId(),
                pt != null ? pt.getId()   : null,
                pt != null ? pt.getName() : null,
                f.isEsPrincipal(),
                f.getOriginalFilename(),
                f.getMimeType(),
                f.getFilePath(),
                f.getCaption(),
                f.getFileSizeBytes(),
                f.getThumbnailPath(),
                f.getWidth(),
                f.getHeight(),
                f.getTakenAt(),
                f.getCreatedAt()
        );
    }
}
