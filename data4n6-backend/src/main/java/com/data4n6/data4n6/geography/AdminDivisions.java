package com.data4n6.data4n6.geography;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_admin_divisions", schema = "data4n6")
@AttributeOverride(name = "id", column = @Column(name = "t200_admin_divisions_id"))
public class AdminDivisions extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_countries_id", nullable = false)
    private Countries country;

    @Column(name = "iso_code", length = 10)
    private String isoCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
