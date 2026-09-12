package com.logstream.backend.service;

import com.logstream.backend.ingestion.LogValidator;
import com.logstream.backend.model.LogEntry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LogIngestionService {

    private final LogValidator logValidator;
    private final LogIndexerService logIndexerService;

    public LogIngestionService(
            LogValidator logValidator,
            LogIndexerService logIndexerService) {

        this.logValidator = logValidator;
        this.logIndexerService = logIndexerService;
    }

    /**
     * Processes a single log entry.
     *
     * @param log the log entry to process
     * @return true if the log was accepted, false otherwise
     */
    public boolean ingest(LogEntry log) {

        if (!logValidator.isValid(log)) {
            return false;
        }

        logIndexerService.index(log);

        return true;
    }

    /**
     * Processes multiple log entries.
     *
     * @param logs list of log entries
     * @return result containing accepted and rejected logs
     */
    public IngestionResult ingestBatch(List<LogEntry> logs) {

        int acceptedCount = 0;
        int rejectedCount = 0;

        List<LogEntry> acceptedLogs = new ArrayList<>();
        List<LogEntry> rejectedLogs = new ArrayList<>();

        if (logs == null) {
            return new IngestionResult(
                    0,
                    0,
                    acceptedLogs,
                    rejectedLogs
            );
        }

        for (LogEntry log : logs) {

            if (logValidator.isValid(log)) {
                acceptedCount++;
                acceptedLogs.add(log);
            } else {
                rejectedCount++;
                rejectedLogs.add(log);
            }
        }

        logIndexerService.indexBatch(acceptedLogs);

        return new IngestionResult(
                acceptedCount,
                rejectedCount,
                acceptedLogs,
                rejectedLogs
        );
    }

    /**
     * Result returned after batch ingestion.
     */
    public static class IngestionResult {

        private final int acceptedCount;
        private final int rejectedCount;
        private final List<LogEntry> acceptedLogs;
        private final List<LogEntry> rejectedLogs;

        public IngestionResult(
                int acceptedCount,
                int rejectedCount,
                List<LogEntry> acceptedLogs,
                List<LogEntry> rejectedLogs) {

            this.acceptedCount = acceptedCount;
            this.rejectedCount = rejectedCount;
            this.acceptedLogs = acceptedLogs;
            this.rejectedLogs = rejectedLogs;
        }

        public int getAcceptedCount() {
            return acceptedCount;
        }

        public int getRejectedCount() {
            return rejectedCount;
        }

        public List<LogEntry> getAcceptedLogs() {
            return acceptedLogs;
        }

        public List<LogEntry> getRejectedLogs() {
            return rejectedLogs;
        }
    }
}