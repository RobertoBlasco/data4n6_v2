package com.data4n6.inventory.articulo.repository;

import com.data4n6.inventory.articulo.Articulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArticuloRepository extends JpaRepository<Articulo, UUID> {

    @Query("SELECT a FROM Articulo a LEFT JOIN FETCH a.tipoMaterial LEFT JOIN FETCH a.brand LEFT JOIN FETCH a.almacen LEFT JOIN FETCH a.modelo WHERE a.deletedAt IS NULL")
    List<Articulo> findAllActive();

    @Query("SELECT a FROM Articulo a LEFT JOIN FETCH a.tipoMaterial LEFT JOIN FETCH a.brand LEFT JOIN FETCH a.almacen LEFT JOIN FETCH a.modelo WHERE a.id = :id AND a.deletedAt IS NULL")
    Optional<Articulo> findActiveById(UUID id);

    boolean existsByBrandIdAndDeletedAtIsNull(UUID brandId);
    boolean existsByAlmacenIdAndDeletedAtIsNull(UUID almacenId);

    @Query("SELECT COUNT(a) FROM Articulo a WHERE a.tipoMaterial.id = :tipoMaterialId AND a.deletedAt IS NULL")
    long countByTipoMaterialId(UUID tipoMaterialId);

    @Query("SELECT COUNT(a) FROM Articulo a JOIN EventoHistorial eh ON eh.articulo.id = a.id WHERE a.tipoMaterial.id = :tipoMaterialId AND a.deletedAt IS NULL AND eh.estadoResultante = 'Almacén' AND eh.id = (SELECT MAX(eh2.id) FROM EventoHistorial eh2 WHERE eh2.articulo.id = a.id)")
    long countDisponiblesByTipoMaterialId(UUID tipoMaterialId);

    @Query(value = """
        SELECT a.t100_articulos_id as id,
               COUNT(DISTINCT n.t300_notes_id) as num_notas,
               COUNT(DISTINCT p.t100_pictures_id) as num_fotos,
               COUNT(DISTINCT d.t100_documents_id) as num_documentos
        FROM inventario.t100_articulos a
        LEFT JOIN inventario.t300_notes n
            ON n.record_id = a.t100_articulos_id
            AND n.t900_app_tables_id = (SELECT t900_app_tables_id FROM seguridad.t900_app_tables WHERE table_name = 't100_articulos')
            AND n.deleted_at IS NULL
        LEFT JOIN inventario.t100_pictures p
            ON p.record_id = a.t100_articulos_id
            AND p.t900_app_tables_id = (SELECT t900_app_tables_id FROM seguridad.t900_app_tables WHERE table_name = 't100_articulos')
            AND p.deleted_at IS NULL
        LEFT JOIN inventario.t100_documents d
            ON d.record_id = a.t100_articulos_id
            AND d.t900_app_tables_id = (SELECT t900_app_tables_id FROM seguridad.t900_app_tables WHERE table_name = 't100_articulos')
            AND d.deleted_at IS NULL
        WHERE a.t100_articulos_id IN :ids
        GROUP BY a.t100_articulos_id
        """, nativeQuery = true)
    List<Object[]> countAttachmentsByArticuloIds(List<UUID> ids);

    @Query(value = """
        SELECT DISTINCT ON (n.record_id) n.record_id, n.body
        FROM inventario.t300_notes n
        WHERE n.record_id IN :ids
            AND n.t900_app_tables_id = (SELECT t900_app_tables_id FROM seguridad.t900_app_tables WHERE table_name = 't100_articulos')
            AND n.deleted_at IS NULL
        ORDER BY n.record_id, n.created_at DESC
        """, nativeQuery = true)
    List<Object[]> findUltimaNotaByArticuloIds(List<UUID> ids);
}
