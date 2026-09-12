package com.logstream.backend.service;

import com.logstream.backend.ingestion.LogValidator;
import com.logstream.backend.model.LogEntry;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LogIngestionServiceTest {

    @Test
    void shouldIndexValidLog() {

        LogValidator validator = new LogValidator();
        TestLogIndexerService indexer = new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(validator, indexer);

        LogEntry log = createValidLog("log-001");

        boolean result = service.ingest(log);

        assertTrue(result);
        assertEquals(1, indexer.indexedLogs.size());
        assertEquals("log-001", indexer.indexedLogs.get(0).getId());
    }

    @Test
    void shouldNotIndexInvalidLog() {

        LogValidator validator = new LogValidator();
        TestLogIndexerService indexer = new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(validator, indexer);

        LogEntry invalidLog = createValidLog("");

        boolean result = service.ingest(invalidLog);

        assertFalse(result);
        assertTrue(indexer.indexedLogs.isEmpty());
    }

    @Test
    void shouldIndexOnlyValidLogsInBatch() {

        LogValidator validator = new LogValidator();
        TestLogIndexerService indexer = new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(validator, indexer);

        LogEntry validLog1 = createValidLog("log-001");
        LogEntry invalidLog = createValidLog("");
        LogEntry validLog2 = createValidLog("log-002");

        List<LogEntry> logs = Arrays.asList(
                validLog1,
                invalidLog,
                validLog2
        );

        LogIngestionService.IngestionResult result =
                service.ingestBatch(logs);

        assertEquals(2, result.getAcceptedCount());
        assertEquals(1, result.getRejectedCount());

        assertEquals(2, indexer.indexedLogs.size());

        assertEquals(
                "log-001",
                indexer.indexedLogs.get(0).getId()
        );

        assertEquals(
                "log-002",
                indexer.indexedLogs.get(1).getId()
        );
    }

    @Test
    void shouldHandleNullBatch() {

        LogValidator validator = new LogValidator();
        TestLogIndexerService indexer = new TestLogIndexerService();

        LogIngestionService service =
                new LogIngestionService(validator, indexer);

        LogIngestionService.IngestionResult result =
                service.ingestBatch(null);

        assertEquals(0, result.getAcceptedCount());
        assertEquals(0, result.getRejectedCount());
        assertTrue(indexer.indexedLogs.isEmpty());
    }

    private LogEntry createValidLog(String id) {

        return new LogEntry(
                id,
                Instant.parse("2026-09-11T17:30:00Z"),
                LogEntry.LogLevel.INFO,
                "payment-service",
                "server-01",
                "Payment processed successfully",
                120,
                "trace-001"
        );
    }

    /**
     * Test implementation of the indexing interface.
     *
     * It records logs instead of writing to Lucene.
     */
    private static class TestLogIndexerService
            implements LogIndexerService {

        private final List<LogEntry> indexedLogs =
                new java.util.ArrayList<>();

        @Override
        public void index(LogEntry log) {
            indexedLogs.add(log);
        }

        @Override
        public void indexBatch(Iterable<LogEntry> logs) {

            for (LogEntry log : logs) {
                indexedLogs.add(log);
            }
        }
    }
}