package com.data4n6.data4n6.exhibits;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExhibitRepository extends JpaRepository<Exhibit, UUID> {

    @Query("SELECT e FROM Exhibit e JOIN FETCH e.status WHERE e.event.id = :eventId AND e.deletedAt IS NULL ORDER BY e.sequenceNumber")
    List<Exhibit> findAllActiveByEvent(@Param("eventId") UUID eventId);

    @Query("SELECT e FROM Exhibit e JOIN FETCH e.status WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Exhibit> findActiveById(@Param("id") UUID id);

    @Query("SELECT COALESCE(MAX(e.sequenceNumber), 0) FROM Exhibit e WHERE e.event.id = :eventId")
    int findMaxSequenceNumberByEvent(@Param("eventId") UUID eventId);
}
