package com.logstream.backend.service;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.model.LogEntry;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceImplTest {

    private final AnalyticsServiceImpl analyticsService =
            new AnalyticsServiceImpl();

    @Test
    void shouldReturnEmptyResultForNullLogs() {

        AnalyticsResult result =
                analyticsService.analyze(null);

        assertNotNull(result);
        assertEquals(0, result.getTotalLogs());
        assertEquals(0, result.getErrorCount());
        assertEquals(0, result.getWarnCount());
        assertEquals(0, result.getInfoCount());
        assertEquals(0, result.getDebugCount());
        assertEquals(0.0, result.getAverageResponseTimeMs());
        assertTrue(result.getLogsByService().isEmpty());
    }

    @Test
    void shouldCalculateLogLevelCounts() {

        List<LogEntry> logs = List.of(
                createLog("1", LogEntry.LogLevel.ERROR, "payment", 100),
                createLog("2", LogEntry.LogLevel.ERROR, "payment", 200),
                createLog("3", LogEntry.LogLevel.WARN, "order", 300),
                createLog("4", LogEntry.LogLevel.INFO, "order", 400),
                createLog("5", LogEntry.LogLevel.DEBUG, "auth", 500)
        );

        AnalyticsResult result =
                analyticsService.analyze(logs);

        assertEquals(5, result.getTotalLogs());
        assertEquals(2, result.getErrorCount());
        assertEquals(1, result.getWarnCount());
        assertEquals(1, result.getInfoCount());
        assertEquals(1, result.getDebugCount());
    }

    @Test
    void shouldCalculateLogsByService() {

        List<LogEntry> logs = List.of(
                createLog("1", LogEntry.LogLevel.INFO, "payment-service", 100),
                createLog("2", LogEntry.LogLevel.ERROR, "payment-service", 200),
                createLog("3", LogEntry.LogLevel.INFO, "order-service", 300)
        );

        AnalyticsResult result =
                analyticsService.analyze(logs);

        assertEquals(
                2L,
                result.getLogsByService().get("payment-service")
        );

        assertEquals(
                1L,
                result.getLogsByService().get("order-service")
        );
    }

    @Test
    void shouldCalculateAverageResponseTime() {

        List<LogEntry> logs = List.of(
                createLog("1", LogEntry.LogLevel.INFO, "service-a", 100),
                createLog("2", LogEntry.LogLevel.INFO, "service-a", 200),
                createLog("3", LogEntry.LogLevel.INFO, "service-a", 300)
        );

        AnalyticsResult result =
                analyticsService.analyze(logs);

        assertEquals(
                200.0,
                result.getAverageResponseTimeMs()
        );
    }

    @Test
void shouldIgnoreNullEntries() {

    List<LogEntry> logs = new java.util.ArrayList<>();

    logs.add(createLog(
            "1",
            LogEntry.LogLevel.ERROR,
            "payment",
            100
    ));

    logs.add(null);

    logs.add(createLog(
            "2",
            LogEntry.LogLevel.INFO,
            "order",
            200
    ));

    AnalyticsResult result =
            analyticsService.analyze(logs);

    assertEquals(2, result.getTotalLogs());
    assertEquals(1, result.getErrorCount());
    assertEquals(1, result.getInfoCount());
}

    private LogEntry createLog(
            String id,
            LogEntry.LogLevel level,
            String service,
            long responseTime) {

        return new LogEntry(
                id,
                Instant.parse("2026-09-17T12:00:00Z"),
                level,
                service,
                "server-01",
                "Test log",
                responseTime,
                "trace-" + id
        );
    }
}