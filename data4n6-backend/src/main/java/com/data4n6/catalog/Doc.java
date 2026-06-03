package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity(name = "CommonDoc")
@Table(name = "t200_docs", schema = "common")
public class Doc {

    @Id
    @Column(name = "t200_docs_id")
    private UUID id;

    @Column(length = 100, nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
