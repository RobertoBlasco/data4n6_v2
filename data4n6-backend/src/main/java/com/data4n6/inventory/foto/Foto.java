package com.data4n6.inventory.foto;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.PictureType;
import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t300_pictures", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t300_pictures_id"))
public class Foto extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t000_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @Column(length = 255, nullable = false)
    private String filename;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_path", length = 500, nullable = false)
    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_pictures_id")
    private PictureType pictureType;

    @Column(name = "es_principal", nullable = false)
    private boolean esPrincipal = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
