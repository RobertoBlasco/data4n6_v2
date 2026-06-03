package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity(name = "CommonAgent")
@Table(name = "t100_agents", schema = "common")
public class Agent {

    @Id
    @Column(name = "t100_agents_id")
    private UUID id;

    @Column(name = "call_sign", length = 50)
    private String callSign;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_units_id", nullable = false)
    private Unit unit;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
