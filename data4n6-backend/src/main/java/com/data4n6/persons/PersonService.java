package com.data4n6.persons;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import com.data4n6.common.exception.ResourceNotFoundException;
import com.data4n6.persons.dto.PersonRequest;
import com.data4n6.persons.dto.PersonResponse;
import com.data4n6.persons.dto.PersonRoleResponse;
import com.data4n6.persons.dto.PersonSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonService {

    private final PersonRepository personRepository;
    private final PersonLinkRepository linkRepository;
    private final PersonRoleRepository roleRepository;
    private final AppTableRepository appTableRepository;
    private final PersonMapper mapper;

    public List<PersonSummaryResponse> findByEntity(String tableName, UUID recordId) {
        return linkRepository.findByTableNameAndRecord(tableName, recordId).stream()
                .map(pl -> new PersonSummaryResponse(
                        pl.getPerson().getId(),
                        pl.getPerson().getFirstName(),
                        pl.getPerson().getLastName(),
                        pl.getPerson().getNationalId(),
                        pl.getRole().getName(),
                        pl.getRole().getCode(),
                        pl.getPerson().getCreatedAt()
                ))
                .toList();
    }

    public List<PersonRoleResponse> findAllRoles() {
        return roleRepository.findAllActive().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public PersonResponse create(PersonRequest request) {
        Person person = mapper.toEntity(request);
        person = personRepository.save(person);

        AppTable table = appTableRepository.findByTableName(request.tableName())
                .orElseThrow(() -> new ResourceNotFoundException("AppTable", request.tableName()));
        PersonRole role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("PersonRole", request.roleId()));

        PersonLink link = new PersonLink();
        link.setPerson(person);
        link.setAppTable(table);
        link.setRecordId(request.recordId());
        link.setRole(role);
        linkRepository.save(link);

        return mapper.toResponse(person);
    }
}
