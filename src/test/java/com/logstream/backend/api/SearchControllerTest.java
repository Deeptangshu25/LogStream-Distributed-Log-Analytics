package com.logstream.backend.api;

import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.backend.service.SearchService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class SearchControllerTest {

    @Test
    void shouldSearchLogs() {

        SearchService searchService =
                mock(SearchService.class);

        SearchResult result =
                new SearchResult(
                        List.of(),
                        0,
                        0,
                        20
                );

        when(searchService.search(any(SearchRequest.class)))
                .thenReturn(result);

        SearchController controller =
                new SearchController(searchService);

        var response =
                controller.searchLogs(
                        "payment failed",
                        "payment-service",
                        "ERROR",
                        null,
                        null,
                        null,
                        0,
                        20
                );

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(response.getBody());

        assertEquals(
                0,
                response.getBody().getTotalHits()
        );

        assertEquals(
                0,
                response.getBody().getPage()
        );

        assertEquals(
                20,
                response.getBody().getSize()
        );

        assertTrue(
                response.getBody().getLogs().isEmpty()
        );

        verify(searchService, times(1))
                .search(any(SearchRequest.class));
    }

    @Test
    void shouldUseDefaultPaginationValues() {

        SearchService searchService =
                mock(SearchService.class);

        SearchResult result =
                new SearchResult(
                        List.of(),
                        0,
                        0,
                        20
                );

        when(searchService.search(any(SearchRequest.class)))
                .thenReturn(result);

        SearchController controller =
                new SearchController(searchService);

        var response =
                controller.searchLogs(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        0,
                        20
                );

        assertEquals(
                200,
                response.getStatusCode().value()
        );

        assertNotNull(response.getBody());

        assertEquals(
                0,
                response.getBody().getPage()
        );

        assertEquals(
                20,
                response.getBody().getSize()
        );

        verify(searchService, times(1))
                .search(any(SearchRequest.class));
    }

    @Test
    void shouldPassAllSearchFiltersToService() {

        SearchService searchService =
                mock(SearchService.class);

        SearchResult result =
                new SearchResult(
                        List.of(),
                        0,
                        1,
                        10
                );

        when(searchService.search(any(SearchRequest.class)))
                .thenReturn(result);

        SearchController controller =
                new SearchController(searchService);

        controller.searchLogs(
                "payment failed",
                "payment-service",
                "ERROR",
                "server-01",
                "2026-09-17T10:00:00Z",
                "2026-09-17T18:00:00Z",
                1,
                10
        );

        verify(searchService).search(
                argThat(request ->
                        "payment failed".equals(
                                request.getQuery()
                        )
                        &&
                        "payment-service".equals(
                                request.getService()
                        )
                        &&
                        "ERROR".equals(
                                request.getLevel()
                        )
                        &&
                        "server-01".equals(
                                request.getHost()
                        )
                        &&
                        "2026-09-17T10:00:00Z".equals(
                                request.getStartTime()
                        )
                        &&
                        "2026-09-17T18:00:00Z".equals(
                                request.getEndTime()
                        )
                        &&
                        request.getPage() == 1
                        &&
                        request.getSize() == 10
                )
        );
    }
}