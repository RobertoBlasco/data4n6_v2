package com.data4n6.persons;

import com.data4n6.persons.dto.PersonRequest;
import com.data4n6.persons.dto.PersonResponse;
import com.data4n6.persons.dto.PersonRoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PersonMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Person toEntity(PersonRequest request);

    PersonResponse toResponse(Person person);

    PersonRoleResponse toResponse(PersonRole role);
}
