package com.data4n6.inventory;

import com.data4n6.catalog.AppTable;
import com.data4n6.catalog.AppTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class MetadataService {

    private final MetadataRepository metadataRepository;
    private final AppTableRepository appTableRepository;

    private final Map<String, AppTable> tableCache = new ConcurrentHashMap<>();

    @Transactional
    public void onCreate(UUID recordUuid, String tableName) {
        Metadata metadata = new Metadata();
        metadata.setRecordUuid(recordUuid);
        metadata.setAppTable(resolveTable(tableName));
        metadataRepository.save(metadata);
    }

    @Transactional
    public void onUpdate(UUID recordUuid) {
        metadataRepository.findByRecordUuid(recordUuid)
                .ifPresent(metadataRepository::save);
    }

    private AppTable resolveTable(String tableName) {
        return tableCache.computeIfAbsent(tableName, name ->
                appTableRepository.findByTableName(name)
                        .orElseThrow(() -> new IllegalStateException(
                                "Table not registered in t000_app_tables: " + name)));
    }
}
