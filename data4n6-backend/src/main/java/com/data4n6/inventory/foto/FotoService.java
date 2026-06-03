package com.data4n6.inventory.foto;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import com.data4n6.catalog.PictureType;
import com.data4n6.catalog.PictureTypeRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.inventory.foto.dto.FotoRequest;
import com.data4n6.inventory.foto.dto.FotoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FotoService {

    private final FotoRepository        repository;
    private final AppTableRepository    appTableRepository;
    private final PictureTypeRepository pictureTypeRepository;

    @Value("${inventory.upload.dir}")
    private String uploadDir;

    @Value("${inventory.upload.url-prefix}")
    private String uploadUrlPrefix;

    public List<FotoResponse> findByEntity(UUID appTableId, UUID recordId) {
        return repository
                .findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(appTableId, recordId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public FotoResponse create(FotoRequest req) {
        AppTable appTable = appTableRepository.findById(req.appTableId())
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", req.appTableId().toString()));
        Foto foto = new Foto();
        foto.setAppTable(appTable);
        foto.setRecordId(req.recordId());
        if (req.pictureTypeId() != null)
            pictureTypeRepository.findById(req.pictureTypeId()).ifPresent(foto::setPictureType);
        foto.setEsPrincipal(req.esPrincipal());
        foto.setFilename(req.filename());
        foto.setMimeType(req.mimeType());
        foto.setFilePath(req.filePath());
        foto.setCaption(req.caption());
        return toResponse(repository.save(foto));
    }

    @Transactional
    public FotoResponse upload(UUID appTableId, UUID recordId, UUID pictureTypeId,
                                boolean esPrincipal, String caption, MultipartFile file) {
        String ext      = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving file");
        }
        FotoRequest req = new FotoRequest(
                appTableId, recordId, pictureTypeId, esPrincipal,
                file.getOriginalFilename(), file.getContentType(),
                uploadUrlPrefix + "/" + filename, caption);
        return create(req);
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "";
    }

    @Transactional
    public void delete(UUID id) {
        Foto foto = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Foto", id.toString()));
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
                f.getFilename(),
                f.getMimeType(),
                f.getFilePath(),
                f.getCaption(),
                f.getCreatedAt()
        );
    }
}
