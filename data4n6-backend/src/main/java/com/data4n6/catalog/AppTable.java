package com.data4n6.catalog;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;


@Getter
@Setter
@Entity
@Table(name = "t900_app_tables", schema = "seguridad")
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

    @Column(name = "nombre_singular", length = 100)
    private String nombreSingular;

    @Column(name = "nombre_plural", length = 100)
    private String nombrePlural;

    @Column(length = 100)
    private String icono;

    @Column(length = 100, nullable = false)
    private String vistas = "GRID";

    @Column(name = "endpoint_base", length = 200)
    private String endpointBase;

    @Column(name = "seccion_menu", length = 50)
    private String seccionMenu;

    @Column(name = "orden_menu")
    private Short ordenMenu;

    @Column(name = "form_fields", columnDefinition = "TEXT")
    private String formFields;

    @Column(name = "db_schema", length = 50)
    private String dbSchema;

    @Column(name = "form_route", length = 200)
    private String formRoute;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "t900_apps_id")
    private App application;
}
