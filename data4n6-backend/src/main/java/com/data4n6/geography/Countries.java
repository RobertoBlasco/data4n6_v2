package com.data4n6.geography;

import com.data4n6.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t200_countries")
@AttributeOverride(name = "id", column = @Column(name = "t200_countries_id"))
public class Countries extends BaseEntity {

    @Column(name = "iso_code_2", columnDefinition = "bpchar(2)", nullable = false, unique = true)
    private String isoCode2;

    @Column(name = "iso_code_3", columnDefinition = "bpchar(3)", nullable = false, unique = true)
    private String isoCode3;

    @Column(name = "country_name", nullable = false, unique = true, length = 100)
    private String countryName;

    @Column(name = "phone_prefix", length = 10)
    private String phonePrefix;

    @Column(name = "currency_code", columnDefinition = "bpchar(3)")
    private String currencyCode;

    @Column(name = "flag_emoji", length = 8)
    private String flagEmoji;

    @Column(name = "is_active", nullable = false)
    private boolean active;
}
