package com.logstream.backend.ingestion;

import com.logstream.backend.model.LogEntry;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class LogValidatorTest {

    private final LogValidator validator = new LogValidator();

    @Test
    void shouldAcceptValidLog() {
        LogEntry log = new LogEntry(
                "log-001",
                Instant.parse("2026-09-11T17:30:00Z"),
                LogEntry.LogLevel.INFO,
                "payment-service",
                "server-01",
                "Payment processed successfully",
                120,
                "trace-001"
        );

        assertTrue(validator.isValid(log));
    }

    @Test
    void shouldRejectLogWithMissingId() {
        LogEntry log = new LogEntry(
                "",
                Instant.parse("2026-09-11T17:30:00Z"),
                LogEntry.LogLevel.INFO,
                "payment-service",
                "server-01",
                "Payment processed successfully",
                120,
                "trace-001"
        );

        assertFalse(validator.isValid(log));
    }

    @Test
    void shouldRejectLogWithNegativeResponseTime() {
        LogEntry log = new LogEntry(
                "log-002",
                Instant.parse("2026-09-11T17:30:00Z"),
                LogEntry.LogLevel.ERROR,
                "payment-service",
                "server-01",
                "Payment failed",
                -1,
                "trace-002"
        );

        assertFalse(validator.isValid(log));
    }

    @Test
    void shouldRejectNullLog() {
        assertFalse(validator.isValid(null));
    }
}