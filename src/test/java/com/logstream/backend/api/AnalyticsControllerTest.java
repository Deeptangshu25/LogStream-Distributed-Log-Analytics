package com.logstream.backend.api;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.model.LogEntry;
import com.logstream.backend.service.AnalyticsService;
import com.logstream.backend.service.LogStore;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsControllerTest {

    @Test
    void shouldReturnAnalyticsForStoredLogs() {

        LogStore logStore = new LogStore();

        logStore.add(createLog(
                "log-001",
                LogEntry.LogLevel.INFO,
                "payment-service",
                100
        ));

        logStore.add(createLog(
                "log-002",
                LogEntry.LogLevel.ERROR,
                "payment-service",
                200
        ));

        logStore.add(createLog(
                "log-003",
                LogEntry.LogLevel.WARN,
                "user-service",
                300
        ));

        AnalyticsService analyticsService =
                new com.logstream.backend.service.AnalyticsServiceImpl();

        AnalyticsController controller =
                new AnalyticsController(
                        analyticsService,
                        logStore
                );

        ResponseEntity<AnalyticsResult> response =
                controller.getAnalytics();

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(response.getBody());

        AnalyticsResult result =
                response.getBody();

        assertEquals(3, result.getTotalLogs());

        assertEquals(1, result.getInfoCount());

        assertEquals(1, result.getErrorCount());

        assertEquals(1, result.getWarnCount());

        assertEquals(0, result.getDebugCount());

        assertEquals(
                200.0,
                result.getAverageResponseTimeMs()
        );

        assertEquals(
                2,
                result.getLogsByService()
                        .get("payment-service")
        );

        assertEquals(
                1,
                result.getLogsByService()
                        .get("user-service")
        );
    }

    @Test
    void shouldReturnEmptyAnalyticsWhenStoreIsEmpty() {

        LogStore logStore = new LogStore();

        AnalyticsService analyticsService =
                new com.logstream.backend.service.AnalyticsServiceImpl();

        AnalyticsController controller =
                new AnalyticsController(
                        analyticsService,
                        logStore
                );

        ResponseEntity<AnalyticsResult> response =
                controller.getAnalytics();

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(response.getBody());

        AnalyticsResult result =
                response.getBody();

        assertEquals(0, result.getTotalLogs());

        assertEquals(0, result.getErrorCount());

        assertEquals(0, result.getWarnCount());

        assertEquals(0, result.getInfoCount());

        assertEquals(0, result.getDebugCount());

        assertEquals(
                0.0,
                result.getAverageResponseTimeMs()
        );

        assertTrue(
                result.getLogsByService().isEmpty()
        );
    }

    private LogEntry createLog(
            String id,
            LogEntry.LogLevel level,
            String service,
            long responseTimeMs) {

        return new LogEntry(
                id,
                Instant.parse(
                        "2026-09-17T12:00:00Z"
                ),
                level,
                service,
                "server-01",
                "Test log message",
                responseTimeMs,
                "trace-" + id
        );
    }
}