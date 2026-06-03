package com.data4n6.data4n6.events;                                                                                                                                                                  
                                                                                                                                                                                               
import org.springframework.data.jpa.repository.JpaRepository;                                                                                                                                
import java.util.UUID;                                                                                                                                                                       
                                                        
public interface EventStatusRepository extends JpaRepository<EventStatus, UUID> {
}