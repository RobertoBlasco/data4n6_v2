package com.data4n6.inventory.orden;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class OrdenContadorId implements Serializable {

    @Column(name = "t200_eventos_id")
    private UUID eventoId;

    @Column(name = "anio")
    private short anio;
}
