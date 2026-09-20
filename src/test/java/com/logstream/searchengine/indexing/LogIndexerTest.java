package com.logstream.searchengine.indexing;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.searchengine.search.LogSearchEngine;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LogIndexerTest {

    private IndexManager indexManager;
    private LogIndexer logIndexer;
    private LogSearchEngine searchEngine;

    @BeforeEach
    void setUp() throws Exception {
        indexManager = new IndexManager(new ByteBuffersDirectory(), new StandardAnalyzer());
        logIndexer = new LogIndexer(indexManager);
        searchEngine = new LogSearchEngine(indexManager);
    }

    @AfterEach
    void tearDown() throws Exception {
        searchEngine.close();
    }

    @Test
    void indexesOneLogAndReconstructsAllFields() {
        LogEntry log = log("log-1", "database connection failed", "payment-service", "ERROR");
        logIndexer.index(log);

        SearchRequest request = new SearchRequest();
        request.setQuery("database connection failed");
        SearchResult result = searchEngine.search(request);

        assertEquals(1, result.getTotalHits());
        assertEquals(log.getId(), result.getLogs().get(0).getId());
        assertEquals(log.getTimestamp(), result.getLogs().get(0).getTimestamp());
        assertEquals(log.getLevel(), result.getLogs().get(0).getLevel());
        assertEquals(log.getService(), result.getLogs().get(0).getService());
        assertEquals(log.getHost(), result.getLogs().get(0).getHost());
        assertEquals(log.getMessage(), result.getLogs().get(0).getMessage());
        assertEquals(log.getResponseTimeMs(), result.getLogs().get(0).getResponseTimeMs());
        assertEquals(log.getTraceId(), result.getLogs().get(0).getTraceId());
    }

    @Test
    void indexesBatchUsingTheSameDocumentPath() {
        logIndexer.indexBatch(List.of(
                log("log-1", "first", "service-a", "INFO"),
                log("log-2", "second", "service-b", "ERROR")));

        SearchResult result = searchEngine.search(new SearchRequest());

        assertEquals(2, result.getTotalHits());
    }

    @Test
    void rejectsInvalidLogsBeforeWriting() {
        LogEntry invalid = log("", "message", "service", "INFO");

        assertThrows(IllegalArgumentException.class, () -> logIndexer.index(invalid));
        assertEquals(0, searchEngine.search(new SearchRequest()).getTotalHits());
    }

    private static LogEntry log(String id, String message, String service, String level) {
        return new LogEntry(
                id,
                Instant.parse("2026-09-20T12:00:00Z"),
                LogEntry.LogLevel.valueOf(level),
                service,
                "server-01",
                message,
                120,
                "trace-" + id);
    }
}