package com.data4n6.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppTableRepository extends JpaRepository<AppTable, UUID> {
    Optional<AppTable> findByTableName(String tableName);
    List<AppTable> findBySeccionMenuOrderByOrdenMenu(String seccionMenu);
}
