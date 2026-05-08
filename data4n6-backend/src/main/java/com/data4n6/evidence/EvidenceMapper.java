package com.data4n6.evidence;

import com.data4n6.evidence.dto.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EvidenceMapper {

    // ── Evidence ─────────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "exhibit", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "sequenceNumber", ignore = true)
    @Mapping(target = "condition", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Evidence toEntity(EvidenceRequest request);

    @Mapping(target = "eventId", source = "event.id")
    @Mapping(target = "exhibitId", source = "exhibit.id")
    EvidenceResponse toResponse(Evidence evidence);

    @Mapping(target = "exhibitId", source = "exhibit.id")
    EvidenceSummaryResponse toSummaryResponse(Evidence evidence);

    EvidenceStatusRef toRef(EvidenceStatus status);

    // ── EvidenceStatus ───────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    EvidenceStatus toEntity(EvidenceStatusRequest request);

    EvidenceStatusResponse toResponse(EvidenceStatus status);
}
