package com.data4n6.inventory.foto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FotoRepository extends JpaRepository<Foto, UUID> {

    List<Foto> findByAppTable_IdAndRecordIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID appTableId, UUID recordId);

    Optional<Foto> findFirstByRecordIdAndPictureType_IdAndDeletedAtIsNull(
            UUID recordId, UUID pictureTypeId);
}
