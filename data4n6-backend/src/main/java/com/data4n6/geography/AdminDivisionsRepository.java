package com.data4n6.geography;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AdminDivisionsRepository extends JpaRepository<AdminDivisions, UUID> {

    @Query("SELECT d FROM AdminDivisions d WHERE d.country.id = :countryId AND d.deletedAt IS NULL ORDER BY d.name")
    List<AdminDivisions> findByCountryId(@Param("countryId") UUID countryId);
}
