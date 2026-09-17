package com.logstream.backend.api;

import com.logstream.backend.ingestion.LogValidator;
import com.logstream.backend.model.LogEntry;
import com.logstream.backend.service.LogIndexerService;
import com.logstream.backend.service.LogIngestionService;
import com.logstream.backend.service.LogStore;
import com.logstream.backend.websocket.LiveLogBroadcaster;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LogControllerTest {

    @Test
    void shouldAcceptValidLog() {

        LogController controller = createController();

        LogEntry log = createValidLog("log-001");

        ResponseEntity<String> response =
                controller.ingestLog(log);

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertEquals(
                "Log accepted successfully",
                response.getBody()
        );
    }

    @Test
    void shouldRejectInvalidLog() {

        LogController controller = createController();

        LogEntry invalidLog =
                createValidLog("");

        ResponseEntity<String> response =
                controller.ingestLog(invalidLog);

        assertEquals(
                400,
                response.getStatusCode().value()
        );

        assertEquals(
                "Log rejected during validation",
                response.getBody()
        );
    }

    @Test
    void shouldProcessBatchLogs() {

        LogController controller = createController();

        LogEntry validLog1 =
                createValidLog("log-001");

        LogEntry invalidLog =
                createValidLog("");

        LogEntry validLog2 =
                createValidLog("log-002");

        List<LogEntry> logs = List.of(
                validLog1,
                invalidLog,
                validLog2
        );

        ResponseEntity<LogIngestionService.IngestionResult> response =
                controller.ingestLogs(logs);

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(response.getBody());

        assertEquals(
                2,
                response.getBody().getAcceptedCount()
        );

        assertEquals(
                1,
                response.getBody().getRejectedCount()
        );
    }

    private LogController createController() {

        LogValidator validator =
                new LogValidator();

        LogIndexerService indexer =
                new TestLogIndexerService();

        LogIngestionService ingestionService =
                new LogIngestionService(
                        validator,
                        indexer,
                        new LiveLogBroadcaster(),
                        new LogStore()
                );

        return new LogController(ingestionService);
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

    private static class TestLogIndexerService
            implements LogIndexerService {

        @Override
        public void index(LogEntry log) {
            // Test implementation.
        }

        @Override
        public void indexBatch(Iterable<LogEntry> logs) {
            // Test implementation.
        }
    }
}