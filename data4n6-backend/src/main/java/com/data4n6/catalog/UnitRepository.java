package com.data4n6.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository("commonUnitRepository")
public interface UnitRepository extends JpaRepository<Unit, UUID> {

    List<Unit> findByDeletedAtIsNullOrderByName();

    @Query("""
            SELECT u FROM CommonUnit u
            WHERE u.deletedAt IS NULL
              AND (u.forInventory = true OR (u.forInventory = false AND u.forData4n6 = false))
            ORDER BY u.name
            """)
    List<Unit> findForInventory();

    @Query("""
            SELECT u FROM CommonUnit u
            WHERE u.deletedAt IS NULL
              AND (u.forData4n6 = true OR (u.forInventory = false AND u.forData4n6 = false))
            ORDER BY u.name
            """)
    List<Unit> findForData4n6();
}
