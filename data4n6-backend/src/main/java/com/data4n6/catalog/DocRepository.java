package com.data4n6.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocRepository extends JpaRepository<Doc, UUID> {

    List<Doc> findByDeletedAtIsNullOrderByDescription();
}
