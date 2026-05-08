package com.data4n6.cases;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_case_statuses")
@AttributeOverride(name = "id", column = @Column(name = "t200_case_statuses_id"))
public class CaseStatus extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 7)
    private String color;

    @Column(nullable = false)
    private int displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
