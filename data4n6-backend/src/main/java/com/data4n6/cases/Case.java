package com.data4n6.cases;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "t100_cases")
@AttributeOverride(name = "id", column = @Column(name = "t100_cases_id"))
public class Case extends BaseEntity {

    @Column(nullable = false, unique = true, length = 5)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_case_statuses_id", nullable = false)
    private CaseStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_case_domains_id")
    private CaseDomain domain;

    @Column(name = "t200_cases_level_id")
    private UUID classificationLevelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_case_outcomes_id")
    private CaseOutcome outcome;

    @Column(name = "closed_date")
    private LocalDate closedDate;

    @Column(columnDefinition = "TEXT")
    private String outcomeNotes;

    @Column(name = "outcome_document_id")
    private UUID outcomeDocumentId;

    // EU 2016/680 compliance fields
    private LocalDate retentionReviewDate;

    @Column(length = 20)
    private String retentionCategory;
}
