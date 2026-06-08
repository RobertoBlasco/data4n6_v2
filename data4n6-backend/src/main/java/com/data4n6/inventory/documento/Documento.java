package com.data4n6.inventory.documento;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.DocumentType;
import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t100_documents", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t100_documents_id"))
public class Documento extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t900_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "original_filename", length = 500, nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", length = 500, nullable = false)
    private String storedFilename;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "file_path", columnDefinition = "TEXT", nullable = false)
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_documents_id")
    private DocumentType documentType;
}
