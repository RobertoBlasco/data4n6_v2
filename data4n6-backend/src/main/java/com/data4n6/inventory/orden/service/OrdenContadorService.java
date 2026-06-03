package com.data4n6.inventory.orden.service;

import com.data4n6.inventory.evento.Evento;
import com.data4n6.inventory.orden.OrdenContador;
import com.data4n6.inventory.orden.OrdenContadorId;
import com.data4n6.inventory.orden.repository.OrdenContadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class OrdenContadorService {

    private final OrdenContadorRepository repository;

    @Transactional
    public String generateReference(Evento evento) {
        short anio = (short) LocalDate.now().getYear();

        OrdenContadorId pk = new OrdenContadorId();
        pk.setEventoId(evento.getId());
        pk.setAnio(anio);

        OrdenContador contador = repository.findForUpdate(evento.getId(), anio)
                .orElseGet(() -> {
                    OrdenContador c = new OrdenContador();
                    c.setId(pk);
                    c.setEvento(evento);
                    c.setUltimoNumero(0);
                    return c;
                });

        int siguiente = contador.getUltimoNumero() + 1;
        contador.setUltimoNumero(siguiente);
        repository.save(contador);

        return String.format("%s-%d-%05d", evento.getDescripcionCorta(), anio, siguiente);
    }
}
