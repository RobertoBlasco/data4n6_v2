package com.data4n6.data4n6.units;

import com.data4n6.data4n6.cases.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface UnitRepository extends JpaRepository<Unit, UUID> {

    @Query("SELECT u FROM Unit u LEFT JOIN FETCH u.parent WHERE u.deletedAt IS NULL ORDER BY u.code")
    List<Unit> findAllActive();

    @Query("SELECT c FROM Unit u JOIN u.cases c JOIN FETCH c.status WHERE u.id = :unitId AND c.deletedAt IS NULL ORDER BY c.createdAt DESC")
    List<Case> findCasesByUnitId(UUID unitId);
}
