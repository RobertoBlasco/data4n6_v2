package com.data4n6.data4n6.persons;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PersonRoleRepository extends JpaRepository<PersonRole, UUID> {

    @Query("SELECT r FROM PersonRole r WHERE r.active = true AND r.deletedAt IS NULL ORDER BY r.displayOrder")
    List<PersonRole> findAllActive();
}
