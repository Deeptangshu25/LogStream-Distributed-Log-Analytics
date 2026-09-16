package com.logstream.backend.api;

import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.backend.service.SearchService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SearchControllerTest {

    @Test
    void shouldSearchLogs() {

        SearchService searchService = mock(SearchService.class);

        SearchResult result = new SearchResult(
                List.of(),
                0,
                0,
                20
        );

        when(searchService.search(any(SearchRequest.class)))
                .thenReturn(result);

        SearchController controller =
                new SearchController(searchService);

        var response = controller.searchLogs(
                "payment failed",
                "payment-service",
                "ERROR",
                null,
                null,
                null,
                0,
                20
        );

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());

        assertEquals(0, response.getBody().getTotalHits());
        assertEquals(0, response.getBody().getPage());
        assertEquals(20, response.getBody().getSize());
        assertTrue(response.getBody().getLogs().isEmpty());

        verify(searchService, times(1))
                .search(any(SearchRequest.class));
    }

    @Test
    void shouldUseDefaultPaginationValues() {

        SearchService searchService = mock(SearchService.class);

        SearchResult result = new SearchResult(
                List.of(),
                0,
                0,
                20
        );

        when(searchService.search(any(SearchRequest.class)))
                .thenReturn(result);

        SearchController controller =
                new SearchController(searchService);

        var response = controller.searchLogs(
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                20
        );

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());

        assertEquals(0, response.getBody().getPage());
        assertEquals(20, response.getBody().getSize());

        verify(searchService, times(1))
                .search(any(SearchRequest.class));
    }
}