package com.data4n6.geography;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.geography.dto.CountryRequest;
import com.data4n6.geography.dto.CountryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CountriesService {

    private final CountriesRepository repository;
    private final GeographyMapper mapper;

    public List<CountryResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CountryResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Country", id));
    }

    @Transactional
    public CountryResponse create(CountryRequest request) {
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public CountryResponse update(UUID id, CountryRequest request) {
        Countries country = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country", id));

        country.setCountryName(request.countryName());
        country.setIsoCode2(request.isoCode2());
        country.setIsoCode3(request.isoCode3());
        country.setPhonePrefix(request.phonePrefix());
        country.setCurrencyCode(request.currencyCode());
        country.setFlagEmoji(request.flagEmoji());
        country.setActive(request.active());

        return mapper.toResponse(repository.save(country));
    }

    @Transactional
    public void delete(UUID id) {
        Countries country = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Country", id));
        country.softDelete();
        repository.save(country);
    }
}
