package com.data4n6.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppTableRepository extends JpaRepository<AppTable, UUID> {
    Optional<AppTable> findByTableName(String tableName);
}
