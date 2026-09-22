package com.logstream.backend.api;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.model.LogEntry;
import com.logstream.backend.service.AnalyticsService;
import com.logstream.backend.service.AnalyticsServiceImpl;
import com.logstream.searchengine.indexing.IndexManager;
import com.logstream.searchengine.indexing.LuceneConfig;
import com.logstream.searchengine.search.LogSearchEngine;
import org.apache.lucene.store.ByteBuffersDirectory;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsControllerTest {

    @Test
    void shouldReturnAnalyticsForStoredLogs() throws Exception {

        IndexManager indexManager =
                new IndexManager(
                        new ByteBuffersDirectory(),
                        new LuceneConfig().createAnalyzer()
                );

        LogSearchEngine searchEngine =
                new LogSearchEngine(indexManager);

        indexEngineLogs(searchEngine, indexManager);

        AnalyticsService analyticsService =
                new AnalyticsServiceImpl();

        AnalyticsController controller =
                new AnalyticsController(
                        analyticsService,
                        searchEngine
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

        searchEngine.close();
    }

    @Test
    void shouldReturnEmptyAnalyticsWhenStoreIsEmpty()
            throws Exception {

        IndexManager indexManager =
                new IndexManager(
                        new ByteBuffersDirectory(),
                        new LuceneConfig().createAnalyzer()
                );

        LogSearchEngine searchEngine =
                new LogSearchEngine(indexManager);

        AnalyticsService analyticsService =
                new AnalyticsServiceImpl();

        AnalyticsController controller =
                new AnalyticsController(
                        analyticsService,
                        searchEngine
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

        searchEngine.close();
    }

    private void indexEngineLogs(
            LogSearchEngine searchEngine,
            IndexManager indexManager)
            throws Exception {

        LogEntry log1 = createLog(
                "log-001",
                LogEntry.LogLevel.INFO,
                "payment-service",
                100
        );

        LogEntry log2 = createLog(
                "log-002",
                LogEntry.LogLevel.ERROR,
                "payment-service",
                200
        );

        LogEntry log3 = createLog(
                "log-003",
                LogEntry.LogLevel.WARN,
                "user-service",
                300
        );

        com.logstream.searchengine.indexing.LogIndexer indexer =
                new com.logstream.searchengine.indexing.LogIndexer(
                        indexManager
                );

        indexer.index(log1);
        indexer.index(log2);
        indexer.index(log3);
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