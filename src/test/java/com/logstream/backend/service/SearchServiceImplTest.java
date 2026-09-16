package com.logstream.backend.service;

import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SearchServiceImplTest {

    private final SearchServiceImpl searchService =
            new SearchServiceImpl();

    @Test
    void shouldReturnSearchResult() {

        SearchRequest request = new SearchRequest();

        request.setQuery("payment failed");
        request.setService("payment-service");
        request.setLevel("ERROR");
        request.setPage(1);
        request.setSize(10);

        SearchResult result =
                searchService.search(request);

        assertNotNull(result);
        assertEquals(0, result.getTotalHits());
        assertEquals(1, result.getPage());
        assertEquals(10, result.getSize());
        assertNotNull(result.getLogs());
        assertTrue(result.getLogs().isEmpty());
    }

    @Test
    void shouldHandleNullRequest() {

        SearchResult result =
                searchService.search(null);

        assertNotNull(result);
        assertEquals(0, result.getTotalHits());
        assertEquals(0, result.getPage());
        assertEquals(20, result.getSize());
        assertNotNull(result.getLogs());
    }

    @Test
    void shouldCorrectInvalidPagination() {

        SearchRequest request = new SearchRequest();

        request.setPage(-5);
        request.setSize(-10);

        SearchResult result =
                searchService.search(request);

        assertEquals(0, result.getPage());
        assertEquals(20, result.getSize());
    }

    @Test
    void shouldLimitMaximumPageSize() {

        SearchRequest request = new SearchRequest();

        request.setPage(0);
        request.setSize(500);

        SearchResult result =
                searchService.search(request);

        assertEquals(100, result.getSize());
    }
}