package com.data4n6.report;

import java.util.UUID;

public interface ReportService {
    byte[] reciboPrestamo(UUID ordenId);
}
