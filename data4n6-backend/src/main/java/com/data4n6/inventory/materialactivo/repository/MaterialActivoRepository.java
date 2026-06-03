package com.data4n6.inventory.materialactivo.repository;

import com.data4n6.inventory.materialactivo.MaterialActivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaterialActivoRepository extends JpaRepository<MaterialActivo, UUID> {

    @Query("SELECT m FROM MaterialActivo m JOIN FETCH m.articulo LEFT JOIN FETCH m.almacen WHERE m.articulo.id = :articuloId")
    Optional<MaterialActivo> findByArticulo(@Param("articuloId") UUID articuloId);

    @Query("SELECT m FROM MaterialActivo m LEFT JOIN FETCH m.ultimoEvento ev LEFT JOIN FETCH ev.tipoEvento WHERE m.articulo.id IN :articuloIds")
    List<MaterialActivo> findEstadosByArticuloIds(@Param("articuloIds") List<UUID> articuloIds);
}
