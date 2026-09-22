package com.logstream.backend.service;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.backend.ingestion.LogValidator;
import com.logstream.backend.websocket.LiveLogBroadcaster;
import com.logstream.searchengine.indexing.IndexManager;
import com.logstream.searchengine.indexing.LogIndexer;
import com.logstream.searchengine.search.LogSearchEngine;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LogIngestionLuceneIntegrationTest {

    private IndexManager indexManager;
    private LogSearchEngine searchEngine;
    private LogIngestionService ingestionService;
    private LogStore logStore;

    @BeforeEach
    void setUp() throws Exception {
        indexManager = new IndexManager(
                new ByteBuffersDirectory(),
                new StandardAnalyzer());

        LogIndexer logIndexer = new LogIndexer(indexManager);
        searchEngine = new LogSearchEngine(indexManager);

        logStore = new LogStore();

        ingestionService = new LogIngestionService(
                new LogValidator(),
                logIndexer,
                new LiveLogBroadcaster(),
                logStore);
    }

    @AfterEach
    void tearDown() throws Exception {
        searchEngine.close();
    }

    @Test
    void ingestedBatchBecomesSearchableThroughLucene() {
        LogEntry first = log(
                "integration-001",
                "payment database connection failed",
                "payment-service",
                "ERROR");

        LogEntry second = log(
                "integration-002",
                "payment request completed successfully",
                "payment-service",
                "INFO");

        LogEntry third = log(
                "integration-003",
                "user authentication succeeded",
                "auth-service",
                "INFO");

        LogIngestionService.IngestionResult result =
                ingestionService.ingestBatch(List.of(first, second, third));

        assertEquals(3, result.getAcceptedCount());
        assertEquals(0, result.getRejectedCount());

        SearchRequest request = new SearchRequest();
        request.setQuery("payment");

        SearchResult searchResult = searchEngine.search(request);

        assertEquals(2, searchResult.getTotalHits());
        assertEquals(2, searchResult.getLogs().size());
    }

    @Test
    void rejectedLogDoesNotReachLucene() {
        LogEntry valid = log(
                "integration-valid",
                "valid payment request",
                "payment-service",
                "INFO");

        LogEntry invalid = log(
                "integration-invalid",
                "invalid payment request",
                "",
                "ERROR");

        LogIngestionService.IngestionResult result =
                ingestionService.ingestBatch(List.of(valid, invalid));

        assertEquals(1, result.getAcceptedCount());
        assertEquals(1, result.getRejectedCount());

        SearchRequest request = new SearchRequest();
        request.setQuery("invalid");

        SearchResult searchResult = searchEngine.search(request);

        assertEquals(0, searchResult.getTotalHits());
        assertEquals(0, searchResult.getLogs().size());
    }

    @Test
    void ingestedLogsCanBeRetrievedWithCombinedFilters() {
        LogEntry paymentError = log(
                "integration-error",
                "payment database timeout",
                "payment-service",
                "ERROR");

        LogEntry paymentInfo = log(
                "integration-info",
                "payment request completed",
                "payment-service",
                "INFO");

        LogEntry authError = log(
                "integration-auth",
                "authentication database timeout",
                "auth-service",
                "ERROR");

        ingestionService.ingestBatch(
                List.of(paymentError, paymentInfo, authError));

        SearchRequest request = new SearchRequest();
        request.setQuery("database");
        request.setService("payment-service");
        request.setLevel("ERROR");

        SearchResult result = searchEngine.search(request);

        assertEquals(1, result.getTotalHits());
        assertEquals(
                "integration-error",
                result.getLogs().get(0).getId());
    }

    private static LogEntry log(
            String id,
            String message,
            String service,
            String level) {

        return new LogEntry(
                id,
                Instant.parse("2026-09-22T10:00:00Z"),
                LogEntry.LogLevel.valueOf(level),
                service,
                "integration-server",
                message,
                150,
                "trace-" + id);
    }
}
