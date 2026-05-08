package com.data4n6.geography;

import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.geography.dto.AdminDivisionRequest;
import com.data4n6.geography.dto.AdminDivisionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDivisionsService {

    private final AdminDivisionsRepository repository;
    private final CountriesRepository countriesRepository;
    private final GeographyMapper mapper;

    public List<AdminDivisionResponse> findAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<AdminDivisionResponse> findByCountry(UUID countryId) {
        return repository.findByCountryId(countryId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public AdminDivisionResponse findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AdminDivision", id));
    }

    @Transactional
    public AdminDivisionResponse create(AdminDivisionRequest request) {
        Countries country = countriesRepository.findById(request.countryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country", request.countryId()));

        AdminDivisions division = mapper.toEntity(request);
        division.setCountry(country);

        return mapper.toResponse(repository.save(division));
    }

    @Transactional
    public AdminDivisionResponse update(UUID id, AdminDivisionRequest request) {
        AdminDivisions division = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AdminDivision", id));

        Countries country = countriesRepository.findById(request.countryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country", request.countryId()));

        division.setCountry(country);
        division.setIsoCode(request.isoCode());
        division.setName(request.name());
        division.setType(request.type());
        division.setActive(request.active());

        return mapper.toResponse(repository.save(division));
    }

    @Transactional
    public void delete(UUID id) {
        AdminDivisions division = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AdminDivision", id));
        division.softDelete();
        repository.save(division);
    }
}
