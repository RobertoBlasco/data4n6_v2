package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity(name = "CommonUnit")
@Table(name = "t100_units", schema = "common")
public class Unit {

    @Id
    @Column(name = "t100_units_id")
    private UUID id;

    @Column(length = 20, nullable = false, unique = true)
    private String code;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "for_inventory", nullable = false)
    private boolean forInventory = false;

    @Column(name = "for_data4n6", nullable = false)
    private boolean forData4n6 = false;
}
