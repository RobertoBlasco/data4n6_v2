package com.data4n6.data4n6.events;

import com.data4n6.data4n6.cases.Case;
import com.data4n6.common.entity.BaseEntity;
import com.data4n6.data4n6.geography.AdminDivisions;
import com.data4n6.data4n6.geography.Countries;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "t100_events", schema = "data4n6")
@AttributeOverride(name = "id", column = @Column(name = "t100_events_id"))
public class Event extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_cases_id", nullable = false)
    private Case parentCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_event_statuses_id", nullable = false)
    private EventStatus status;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "location_address", columnDefinition = "TEXT")
    private String locationAddress;

    @Column(name = "location_city", length = 100)
    private String locationCity;

    @Column(name = "location_coordinates", length = 50)
    private String locationCoordinates;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_countries_id")
    private Countries country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_admin_divisions_id")
    private AdminDivisions adminDivision;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
