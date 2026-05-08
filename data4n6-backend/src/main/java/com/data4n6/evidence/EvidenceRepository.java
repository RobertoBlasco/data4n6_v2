package com.data4n6.evidence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvidenceRepository extends JpaRepository<Evidence, UUID> {

    @Query("SELECT e FROM Evidence e JOIN FETCH e.status WHERE e.event.id = :eventId AND e.deletedAt IS NULL ORDER BY e.sequenceNumber")
    List<Evidence> findAllActiveByEvent(@Param("eventId") UUID eventId);

    @Query("SELECT e FROM Evidence e JOIN FETCH e.status WHERE e.exhibit.id = :exhibitId AND e.deletedAt IS NULL ORDER BY e.sequenceNumber")
    List<Evidence> findAllActiveByExhibit(@Param("exhibitId") UUID exhibitId);

    @Query("SELECT e FROM Evidence e JOIN FETCH e.status WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Evidence> findActiveById(@Param("id") UUID id);

    @Query("SELECT COALESCE(MAX(e.sequenceNumber), 0) FROM Evidence e WHERE e.event.id = :eventId")
    int findMaxSequenceNumberByEvent(@Param("eventId") UUID eventId);
}
