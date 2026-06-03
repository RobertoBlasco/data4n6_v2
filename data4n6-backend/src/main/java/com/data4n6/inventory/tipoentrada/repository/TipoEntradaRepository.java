package com.data4n6.inventory.tipoentrada.repository;

import com.data4n6.inventory.tipoentrada.TipoEntrada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TipoEntradaRepository extends JpaRepository<TipoEntrada, UUID> {

    @Query("SELECT t FROM TipoEntrada t WHERE t.deletedAt IS NULL ORDER BY t.nombre")
    List<TipoEntrada> findAllActive();
}
