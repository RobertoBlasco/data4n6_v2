package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Getter
@Entity
@Table(name = "t900_apps", schema = "seguridad")
public class App {

    @Id
    @Column(name = "t900_apps_id")
    private UUID id;

    @Column(length = 50, nullable = false, unique = true)
    private String name;

    @Column(name = "display_name", length = 100, nullable = false)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String icono;
}
