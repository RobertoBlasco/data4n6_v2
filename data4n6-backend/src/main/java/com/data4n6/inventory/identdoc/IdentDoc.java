package com.data4n6.inventory.identdoc;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.Doc;
import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity(name = "InventoryIdentDoc")
@Table(name = "t300_docs", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t300_docs_id"))
public class IdentDoc extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t000_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_docs_id")
    private Doc docType;

    @Column(length = 100, nullable = false)
    private String numero;

    @Column(name = "fecha_caducidad")
    private LocalDate fechaCaducidad;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
