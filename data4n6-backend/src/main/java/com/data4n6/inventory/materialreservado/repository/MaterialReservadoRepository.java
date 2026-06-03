package com.data4n6.inventory.materialreservado.repository;

import com.data4n6.inventory.materialreservado.MaterialReservado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaterialReservadoRepository extends JpaRepository<MaterialReservado, UUID> {

    @Query("SELECT r FROM MaterialReservado r WHERE r.articulo.id = :articuloId")
    Optional<MaterialReservado> findByArticulo(@Param("articuloId") UUID articuloId);

    @Query("SELECT r FROM MaterialReservado r JOIN FETCH r.articulo WHERE r.propuesta.id = :propuestaId")
    List<MaterialReservado> findByPropuesta(@Param("propuestaId") UUID propuestaId);

    @Modifying
    @Query("DELETE FROM MaterialReservado r WHERE r.expiraEn < :ahora")
    int deleteExpired(@Param("ahora") Instant ahora);
}
