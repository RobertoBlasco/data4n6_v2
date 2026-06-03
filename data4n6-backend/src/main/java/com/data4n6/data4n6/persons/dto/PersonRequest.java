package com.data4n6.data4n6.persons.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record PersonRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String nationalId,
        LocalDate dateOfBirth,
        String gender,
        String phone,
        String email,
        String address,
        String notes,
        @NotNull UUID roleId,
        @NotBlank String tableName,
        @NotNull UUID recordId
) {}
