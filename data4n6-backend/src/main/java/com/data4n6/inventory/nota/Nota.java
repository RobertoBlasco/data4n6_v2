package com.data4n6.inventory.nota;

import com.data4n6.catalog.AppTable;
import com.data4n6.common.entity.InventoryBaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t300_notes", schema = "inventario")
@AttributeOverride(name = "id", column = @Column(name = "t300_notes_id"))
public class Nota extends InventoryBaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t900_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
