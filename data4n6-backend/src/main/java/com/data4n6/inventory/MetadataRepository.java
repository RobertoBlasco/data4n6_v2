package com.data4n6.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MetadataRepository extends JpaRepository<Metadata, UUID> {
    Optional<Metadata> findByRecordUuid(UUID recordUuid);
}
