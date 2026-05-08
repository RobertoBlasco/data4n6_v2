package com.data4n6.cases;

import com.data4n6.cases.dto.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CaseMapper {

    // ── Case ────────────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "outcome", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Case toEntity(CaseRequest request);

    CaseResponse toResponse(Case c);

    CaseSummaryResponse toSummaryResponse(Case c);

    CaseStatusRef toRef(CaseStatus status);

    CaseOutcomeRef toRef(CaseOutcome outcome);

    // ── CaseStatus ──────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CaseStatus toEntity(CaseStatusRequest request);

    CaseStatusResponse toResponse(CaseStatus status);

    // ── CaseOutcome ─────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CaseOutcome toEntity(CaseOutcomeRequest request);

    CaseOutcomeResponse toResponse(CaseOutcome outcome);

    // ── CaseLevel ───────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CaseLevel toEntity(CaseLevelRequest request);

    CaseLevelResponse toResponse(CaseLevel level);

    // ── CaseDomain ──────────────────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CaseDomain toEntity(CaseDomainRequest request);

    @Mapping(target = "parentId",   source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    CaseDomainResponse toResponse(CaseDomain domain);
}
