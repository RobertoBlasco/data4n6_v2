package com.data4n6.inventory;

import com.data4n6.catalog.AppTable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t500_metadata", schema = "inventario")
@EntityListeners(AuditingEntityListener.class)
public class Metadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t500_metadata_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "record_uuid", nullable = false, updatable = false)
    private UUID recordUuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t900_app_tables_id", nullable = false, updatable = false)
    private AppTable appTable;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
