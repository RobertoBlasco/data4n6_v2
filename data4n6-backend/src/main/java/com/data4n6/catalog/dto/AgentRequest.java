package com.data4n6.catalog.dto;

import java.util.UUID;

public record AgentRequest(
        String  callSign,
        String  firstName,
        String  lastName,
        UUID    unitId,
        boolean active
) {}
