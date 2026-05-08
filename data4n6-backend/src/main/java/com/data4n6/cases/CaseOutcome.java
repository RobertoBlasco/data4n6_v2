package com.data4n6.cases;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_case_outcomes")
@AttributeOverride(name = "id", column = @Column(name = "t200_case_outcomes_id"))
public class CaseOutcome extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
