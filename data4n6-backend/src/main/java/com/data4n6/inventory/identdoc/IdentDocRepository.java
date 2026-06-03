package com.data4n6.inventory.identdoc;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IdentDocRepository extends JpaRepository<IdentDoc, UUID> {

    List<IdentDoc> findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID appTableId, UUID recordId);
}
