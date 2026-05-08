package com.data4n6.persons;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PersonLinkRepository extends JpaRepository<PersonLink, UUID> {

    @Query("""
            SELECT pl FROM PersonLink pl
            JOIN FETCH pl.person p
            JOIN FETCH pl.role r
            JOIN pl.appTable at
            WHERE at.tableName = :tableName AND pl.recordId = :recordId AND p.deletedAt IS NULL
            """)
    List<PersonLink> findByTableNameAndRecord(String tableName, UUID recordId);
}
