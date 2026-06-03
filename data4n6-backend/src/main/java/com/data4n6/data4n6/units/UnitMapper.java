package com.data4n6.data4n6.units;

import com.data4n6.data4n6.units.dto.UnitRequest;
import com.data4n6.data4n6.units.dto.UnitResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UnitMapper {

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "parent",    ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Unit toEntity(UnitRequest request);

    @Mapping(target = "parentId",   source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    UnitResponse toResponse(Unit unit);
}
