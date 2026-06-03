package com.data4n6.data4n6.geography.dto;

import java.util.UUID;
import java.time.Instant;

public record CountryResponse(

        UUID id,
        String countryName,
        String isoCode2,
        String isoCode3,
        String phonePrefix,
        String currencyCode,
        String flagEmoji,
        boolean active,
        Instant createdAt, 
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {}