package com.data4n6.geography.dto;

import jakarta.validation.constraints.*;

public record CountryRequest(

        @NotBlank
        @Size(max = 100)
        String countryName,

        @NotBlank
        @Size(min = 2, max = 2)
        String isoCode2,

        @NotBlank
        @Size(min = 3, max = 3)
        String isoCode3,
        
        @Size(max = 10)
        String phonePrefix,

        @Size(max = 3)
        String currencyCode,

        @Size(max = 8)
        String flagEmoji,

        boolean active
) {}
