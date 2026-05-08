package com.data4n6.cases;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_cases_level")
@AttributeOverride(name = "id", column = @Column(name = "t200_cases_level_id"))
public class CaseLevel extends BaseEntity {
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer level;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 7)
    private String color;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}