package com.data4n6.data4n6.exhibits;

import com.data4n6.data4n6.exhibits.dto.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ExhibitMapper {

    // ── Exhibit ──────────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "sequenceNumber", ignore = true)
    @Mapping(target = "condition", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Exhibit toEntity(ExhibitRequest request);

    @Mapping(target = "eventId", source = "event.id")
    ExhibitResponse toResponse(Exhibit exhibit);

    ExhibitSummaryResponse toSummaryResponse(Exhibit exhibit);

    ExhibitStatusRef toRef(ExhibitStatus status);

    // ── ExhibitStatus ────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    ExhibitStatus toEntity(ExhibitStatusRequest request);

    ExhibitStatusResponse toResponse(ExhibitStatus status);
}
