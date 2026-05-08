package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Getter
@Entity
@Table(name = "t000_app_tables")
public class AppTable {

    @Id
    @Column(name = "t000_app_tables_id")
    private UUID id;

    @Column(name = "table_name", nullable = false, unique = true, length = 100)
    private String tableName;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
