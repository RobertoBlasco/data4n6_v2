package com.data4n6.persons.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PersonResponse(
        UUID id,
        String firstName,
        String lastName,
        String nationalId,
        LocalDate dateOfBirth,
        String gender,
        String phone,
        String email,
        String address,
        String notes,
        Instant createdAt
) {}
