package com.data4n6.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository("commonAgentRepository")
public interface AgentRepository extends JpaRepository<Agent, UUID> {

    List<Agent> findByDeletedAtIsNullOrderByLastNameAscFirstNameAsc();

    List<Agent> findByUnit_IdAndDeletedAtIsNullOrderByLastNameAscFirstNameAsc(UUID unitId);
}
