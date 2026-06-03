package com.data4n6.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TableFieldRepository extends JpaRepository<TableField, UUID> {
    List<TableField> findByAppTable_IdOrderByOrden(UUID appTableId);
}
