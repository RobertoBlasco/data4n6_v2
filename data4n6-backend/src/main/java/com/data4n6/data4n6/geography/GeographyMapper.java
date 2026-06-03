package com.data4n6.data4n6.geography;

import com.data4n6.data4n6.geography.dto.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface GeographyMapper {

    // ── Countries ────────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Countries toEntity(CountryRequest request);

    CountryResponse toResponse(Countries country);

    // ── AdminDivisions ───────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "country", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    AdminDivisions toEntity(AdminDivisionRequest request);

    @Mapping(target = "countryId", source = "country.id")
    @Mapping(target = "countryName", source = "country.countryName")
    AdminDivisionResponse toResponse(AdminDivisions division);
}
