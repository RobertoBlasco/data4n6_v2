package com.data4n6.units.dto;

import java.util.List;
import java.util.UUID;

public record UnitStatsResponse(
        long totalCases,
        List<StatusCount> byStatus
) {
    public record StatusCount(UUID id, String name, String color, long count) {}
}
