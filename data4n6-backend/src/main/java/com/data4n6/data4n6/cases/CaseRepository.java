package com.data4n6.data4n6.cases;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseRepository extends JpaRepository<Case, UUID> {

    @Query("SELECT c FROM Case c JOIN FETCH c.status WHERE c.deletedAt IS NULL ORDER BY c.createdAt DESC")
    List<Case> findAllActive();

    @Query("SELECT c FROM Case c JOIN FETCH c.status LEFT JOIN FETCH c.outcome WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Case> findActiveById(UUID id);

    @Query("SELECT c FROM Case c JOIN FETCH c.status WHERE c.domain.id = :domainId AND c.deletedAt IS NULL ORDER BY c.createdAt DESC")
    List<Case> findAllActiveByDomain(UUID domainId);
}
