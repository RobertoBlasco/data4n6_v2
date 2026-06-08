package com.data4n6.inventory.foto;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.PictureType;
import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t100_pictures", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t100_pictures_id"))
public class Foto extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t900_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "original_filename", length = 500, nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", length = 500, nullable = false)
    private String storedFilename;

    @Column(name = "mime_type", length = 100, nullable = false)
    private String mimeType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "file_path", columnDefinition = "TEXT", nullable = false)
    private String filePath;

    @Column(name = "thumbnail_path", columnDefinition = "TEXT")
    private String thumbnailPath;

    @Column
    private Integer width;

    @Column
    private Integer height;

    @Column(name = "taken_at")
    private Instant takenAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_pictures_id")
    private PictureType pictureType;

    @Column(name = "es_principal", nullable = false)
    private boolean esPrincipal = false;

    @Column(columnDefinition = "TEXT")
    private String caption;
}
