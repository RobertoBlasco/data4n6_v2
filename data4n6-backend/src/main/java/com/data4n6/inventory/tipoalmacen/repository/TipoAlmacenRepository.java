package com.data4n6.inventory.tipoalmacen.repository;

import com.data4n6.inventory.tipoalmacen.TipoAlmacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TipoAlmacenRepository extends JpaRepository<TipoAlmacen, UUID> {

    @Query("SELECT t FROM TipoAlmacen t WHERE t.deletedAt IS NULL ORDER BY t.name")
    List<TipoAlmacen> findAllActive();
}
