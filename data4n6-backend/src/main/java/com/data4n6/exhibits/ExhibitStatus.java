package com.data4n6.exhibits;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_exhibit_statuses")
@AttributeOverride(name = "id", column = @Column(name = "t200_exhibit_statuses_id"))
public class ExhibitStatus extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 7)
    private String color;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
