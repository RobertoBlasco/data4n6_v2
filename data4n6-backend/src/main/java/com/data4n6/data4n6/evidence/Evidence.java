package com.data4n6.data4n6.evidence;

import com.data4n6.common.entity.BaseEntity;
import com.data4n6.data4n6.events.Event;
import com.data4n6.data4n6.exhibits.Exhibit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "t100_evidence", schema = "data4n6")
@AttributeOverride(name = "id", column = @Column(name = "t100_evidence_id"))
public class Evidence extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_events_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t100_exhibits_id")
    private Exhibit exhibit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "t200_evidence_statuses_id", nullable = false)
    private EvidenceStatus status;

    @Column(name = "sequence_number", nullable = false)
    private int sequenceNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String condition;

    @Column(name = "hash_md5", length = 32)
    private String hashMd5;

    @Column(name = "hash_sha256", length = 64)
    private String hashSha256;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
