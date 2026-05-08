package com.data4n6.persons;

import com.data4n6.catalog.AppTable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t100_person_links",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"t100_persons_id", "t000_app_tables_id", "record_id", "t200_person_roles_id"}
        ))
public class PersonLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "t100_person_links_id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_persons_id", nullable = false)
    private Person person;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t000_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "record_id", nullable = false)
    private UUID recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_person_roles_id", nullable = false)
    private PersonRole role;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
