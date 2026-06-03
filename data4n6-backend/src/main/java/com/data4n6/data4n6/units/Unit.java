package com.data4n6.data4n6.units;

import com.data4n6.data4n6.cases.Case;
import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "t200_units", schema = "data4n6")
@AttributeOverride(name = "id", column = @Column(name = "t200_units_id"))
public class Unit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Unit parent;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "t100_cases_units",
        joinColumns = @JoinColumn(name = "t200_units_id"),
        inverseJoinColumns = @JoinColumn(name = "t100_cases_id")
    )
    private Set<Case> cases = new HashSet<>();
}
