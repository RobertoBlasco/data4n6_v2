package com.data4n6.inventory.documento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentoRepository extends JpaRepository<Documento, UUID> {

    List<Documento> findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID appTableId, UUID recordId);
}
