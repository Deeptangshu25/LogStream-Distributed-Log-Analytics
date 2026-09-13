package com.logstream.backend.api;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.service.LogIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogIngestionService logIngestionService;

    public LogController(LogIngestionService logIngestionService) {
        this.logIngestionService = logIngestionService;
    }

    /**
     * Ingests a single log entry.
     *
     * POST /api/logs
     */
    @PostMapping
    public ResponseEntity<String> ingestLog(
            @RequestBody LogEntry log) {

        boolean accepted =
                logIngestionService.ingest(log);

        if (accepted) {
            return ResponseEntity.ok(
                    "Log accepted successfully"
            );
        }

        return ResponseEntity.badRequest()
                .body("Log rejected during validation");
    }

    /**
     * Ingests multiple log entries.
     *
     * POST /api/logs/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<LogIngestionService.IngestionResult> ingestLogs(
            @RequestBody List<LogEntry> logs) {

        LogIngestionService.IngestionResult result =
                logIngestionService.ingestBatch(logs);

        return ResponseEntity.ok(result);
    }
}