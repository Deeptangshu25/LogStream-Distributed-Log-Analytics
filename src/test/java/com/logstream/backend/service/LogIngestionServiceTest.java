package com.logstream.backend.service;

import com.logstream.backend.ingestion.LogValidator;
import com.logstream.backend.model.LogEntry;
import com.logstream.backend.websocket.LiveLogBroadcaster;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LogIngestionServiceTest {

    @Test
    void shouldIndexValidLog() {

        TestLogIndexerService indexer =
                new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(
                        new LogValidator(),
                        indexer,
                        new LiveLogBroadcaster(),
                        new LogStore()
                );

        LogEntry log = createValidLog("log-001");

        boolean result = service.ingest(log);

        assertTrue(result);
        assertEquals(1, indexer.indexedLogs.size());
        assertEquals(
                "log-001",
                indexer.indexedLogs.get(0).getId()
        );
    }

    @Test
    void shouldNotIndexInvalidLog() {

        TestLogIndexerService indexer =
                new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(
                        new LogValidator(),
                        indexer,
                        new LiveLogBroadcaster(),
                        new LogStore()
                );

        LogEntry invalidLog =
                createValidLog("");

        boolean result =
                service.ingest(invalidLog);

        assertFalse(result);
        assertTrue(indexer.indexedLogs.isEmpty());
    }

    @Test
    void shouldIndexOnlyValidLogsInBatch() {

        TestLogIndexerService indexer =
                new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(
                        new LogValidator(),
                        indexer,
                        new LiveLogBroadcaster(),
                        new LogStore()
                );

        List<LogEntry> logs =
                new ArrayList<>();

        logs.add(createValidLog("log-001"));
        logs.add(createValidLog(""));
        logs.add(createValidLog("log-003"));

        LogIngestionService.IngestionResult result =
                service.ingestBatch(logs);

        assertEquals(
                2,
                result.getAcceptedCount()
        );

        assertEquals(
                1,
                result.getRejectedCount()
        );

        assertEquals(
                2,
                indexer.indexedLogs.size()
        );

        assertEquals(
                "log-001",
                indexer.indexedLogs.get(0).getId()
        );

        assertEquals(
                "log-003",
                indexer.indexedLogs.get(1).getId()
        );
    }

    @Test
    void shouldHandleNullBatch() {

        TestLogIndexerService indexer =
                new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(
                        new LogValidator(),
                        indexer,
                        new LiveLogBroadcaster(),
                        new LogStore()
                );

        LogIngestionService.IngestionResult result =
                service.ingestBatch(null);

        assertEquals(
                0,
                result.getAcceptedCount()
        );

        assertEquals(
                0,
                result.getRejectedCount()
        );

        assertTrue(
                result.getAcceptedLogs().isEmpty()
        );

        assertTrue(
                result.getRejectedLogs().isEmpty()
        );

        assertTrue(
                indexer.indexedLogs.isEmpty()
        );
    }

    private LogEntry createValidLog(String id) {

        return new LogEntry(
                id,
                Instant.parse(
                        "2026-09-17T12:00:00Z"
                ),
                LogEntry.LogLevel.INFO,
                "test-service",
                "server-01",
                "Test log message",
                100,
                "trace-001"
        );
    }

    static class TestLogIndexerService
            implements LogIndexerService {

        private final List<LogEntry> indexedLogs =
                new ArrayList<>();

        @Override
        public void index(LogEntry log) {
            indexedLogs.add(log);
        }

        @Override
        public void indexBatch(
                Iterable<LogEntry> logs) {

            for (LogEntry log : logs) {
                indexedLogs.add(log);
            }
        }
    }
}