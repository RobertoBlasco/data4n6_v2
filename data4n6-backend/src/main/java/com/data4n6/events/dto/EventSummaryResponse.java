package com.data4n6.events.dto;                                                                                                                                                              
import java.time.Instant;                                 
import java.util.UUID;                                                                                                                                                                       

public record EventSummaryResponse(
        UUID id,                                                                                                                                                                             
        String title,                                     
        EventStatusRef status,                                                                                                                                                               
        Instant scheduledAt,
        Instant createdAt                                                                                                                                                                    
) {}   