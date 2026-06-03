package com.data4n6.data4n6.events;
                                                                                                                                                                                               
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;                                                                                                                                      
import java.util.List;
import java.util.Optional;                                                                                                                                                                   
import java.util.UUID;                                    

public interface EventRepository extends JpaRepository<Event, UUID> {                                                                                                                        

    @Query("SELECT e FROM Event e JOIN FETCH e.status WHERE e.parentCase.id = :caseId AND e.deletedAt IS NULL ORDER BY e.createdAt DESC")                                                    
    List<Event> findAllActiveByCase(@Param("caseId") UUID caseId);
                                                                                                                                                                                            
    @Query("SELECT e FROM Event e JOIN FETCH e.status WHERE e.id = :id AND e.deletedAt IS NULL")                                                                                             
    Optional<Event> findActiveById(@Param("id") UUID id);
}   