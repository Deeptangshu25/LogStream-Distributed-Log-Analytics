package com.logstream.searchengine.search;

import com.logstream.backend.model.LogEntry;
import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.searchengine.indexing.IndexManager;
import com.logstream.searchengine.indexing.LogIndexer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LogSearchEngineTest {

    private IndexManager indexManager;
    private LogSearchEngine searchEngine;

    @BeforeEach
    void setUp() throws Exception {
        indexManager = new IndexManager(new ByteBuffersDirectory(), new StandardAnalyzer());
        LogIndexer logIndexer = new LogIndexer(indexManager);
        searchEngine = new LogSearchEngine(indexManager);
        logIndexer.indexBatch(List.of(
                log("1", "database connection failed", "payment-service", "ERROR", "server-01", "2026-09-18T10:00:00Z"),
                log("2", "database connection recovered", "payment-service", "INFO", "server-01", "2026-09-19T10:00:00Z"),
                log("3", "cache lookup failed", "order-service", "ERROR", "server-02", "2026-09-20T10:00:00Z"),
                log("4", "database timeout", "payment-service", "ERROR", "server-01", "2026-09-21T10:00:00Z")));
    }

    @AfterEach
    void tearDown() throws Exception {
        searchEngine.close();
    }

    @Test
    void searchesMessageText() {
        SearchRequest request = request();
        request.setQuery("database");

        assertEquals(3, searchEngine.search(request).getTotalHits());
    }

    @Test
    void emptyQueryReturnsAllIndexedLogs() {
        assertEquals(4, searchEngine.search(request()).getTotalHits());
    }

    @Test
    void filtersByServiceLevelAndHost() {
        SearchRequest request = request();
        request.setService("payment-service");
        request.setLevel("ERROR");
        request.setHost("server-01");

        SearchResult result = searchEngine.search(request);

        assertEquals(2, result.getTotalHits());
        assertEquals(2, result.getLogs().size());
    }

    @Test
    void filtersByService() {
        SearchRequest request = request();
        request.setService("order-service");

        assertEquals(1, searchEngine.search(request).getTotalHits());
    }

    @Test
    void filtersByLevel() {
        SearchRequest request = request();
        request.setLevel("ERROR");

        assertEquals(3, searchEngine.search(request).getTotalHits());
    }

    @Test
    void filtersByHost() {
        SearchRequest request = request();
        request.setHost("server-02");

        assertEquals(1, searchEngine.search(request).getTotalHits());
    }

    @Test
    void appliesCombinedFilters() {
        SearchRequest request = request();
        request.setQuery("database");
        request.setService("payment-service");
        request.setLevel("ERROR");
        request.setHost("server-01");

        assertEquals(2, searchEngine.search(request).getTotalHits());
    }

    @Test
    void appliesInclusiveTimestampRanges() {
        SearchRequest request = request();
        request.setStartTime("2026-09-19T00:00:00Z");
        request.setEndTime("2026-09-20T23:59:59Z");

        assertEquals(2, searchEngine.search(request).getTotalHits());
    }

    @Test
    void returnsNoResultsForReversedTimestampRanges() {
        SearchRequest request = request();
        request.setStartTime("2026-09-21T00:00:00Z");
        request.setEndTime("2026-09-19T00:00:00Z");

        assertEquals(0, searchEngine.search(request).getTotalHits());
    }

    @Test
    void paginatesResultsAndPreservesTotalHits() {
        SearchRequest request = request();
        request.setQuery("database");
        request.setPage(1);
        request.setSize(1);

        SearchResult result = searchEngine.search(request);

        assertEquals(3, result.getTotalHits());
        assertEquals(1, result.getLogs().size());
        assertEquals(1, result.getPage());
        assertEquals(1, result.getSize());
    }

    @Test
    void returnsEmptyResultsWhenNothingMatches() {
        SearchRequest request = request();
        request.setQuery("does-not-exist");

        SearchResult result = searchEngine.search(request);

        assertEquals(0, result.getTotalHits());
        assertEquals(0, result.getLogs().size());
    }

    private static SearchRequest request() {
        return new SearchRequest();
    }

    private static LogEntry log(
            String id,
            String message,
            String service,
            String level,
            String host,
            String timestamp) {
        return new LogEntry(
                id,
                Instant.parse(timestamp),
                LogEntry.LogLevel.valueOf(level),
                service,
                host,
                message,
                100,
                "trace-" + id);
    }
}