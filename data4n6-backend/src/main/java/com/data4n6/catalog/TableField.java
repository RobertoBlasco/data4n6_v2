package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t900_table_fields", schema = "seguridad")
public class TableField {

    @Id
    @Column(name = "t900_table_fields_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t000_app_tables_id", nullable = false)
    private AppTable appTable;

    @Column(name = "field_name", length = 100, nullable = false)
    private String fieldName;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "field_type", length = 50, nullable = false)
    private String fieldType = "text";

    @Column(nullable = false)
    private boolean required = false;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(columnDefinition = "TEXT")
    private String placeholder;

    @Column(length = 200)
    private String endpoint;

    @Column(name = "visible_in_grid", nullable = false)
    private boolean visibleInGrid = true;

    @Column(name = "visible_in_form", nullable = false)
    private boolean visibleInForm = true;

    @Column
    private Short orden;

    @Column(name = "grid_width")
    private Short gridWidth;

    @Column(name = "grid_align", length = 10)
    private String gridAlign;
}
