package com.data4n6.data4n6.cases;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t300_case_status_actions", schema = "data4n6")
@AttributeOverride(name = "id", column = @Column(name = "t300_case_status_actions_id"))
public class CaseStatusAction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_case_statuses_id", nullable = false)
    private CaseStatus caseStatus;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false, length = 10)
    private String behaviour;
}
