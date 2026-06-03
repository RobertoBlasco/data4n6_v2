package com.data4n6.data4n6.geography;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CountriesRepository extends JpaRepository<Countries, UUID> {}
