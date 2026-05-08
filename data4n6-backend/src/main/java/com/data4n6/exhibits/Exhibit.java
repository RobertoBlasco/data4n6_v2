package com.data4n6.exhibits;

import com.data4n6.common.entity.BaseEntity;
import com.data4n6.events.Event;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t100_exhibits")
@AttributeOverride(name = "id", column = @Column(name = "t100_exhibits_id"))
public class Exhibit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_events_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_exhibit_statuses_id", nullable = false)
    private ExhibitStatus status;

    @Column(name = "sequence_number", nullable = false)
    private int sequenceNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String make;

    @Column(length = 100)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(nullable = false, length = 30)
    private String condition;

    @Column(name = "field_location", columnDefinition = "TEXT")
    private String fieldLocation;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
