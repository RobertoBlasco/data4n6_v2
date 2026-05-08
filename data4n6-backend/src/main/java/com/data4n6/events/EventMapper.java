package com.data4n6.events;

import com.data4n6.events.dto.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EventMapper {

    // ── Event ────────────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parentCase", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "country", ignore = true)
    @Mapping(target = "adminDivision", ignore = true)
    @Mapping(target = "startedAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Event toEntity(EventRequest request);

    @Mapping(target = "caseId", source = "parentCase.id")
    @Mapping(target = "countryId", source = "country.id")
    @Mapping(target = "adminDivisionId", source = "adminDivision.id")
    EventResponse toResponse(Event e);

    EventSummaryResponse toSummaryResponse(Event e);

    // ── EventStatus ──────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    EventStatus toEntity(EventStatusRequest request);

    EventStatusResponse toResponse(EventStatus status);

    EventStatusRef toRef(EventStatus status);
}
