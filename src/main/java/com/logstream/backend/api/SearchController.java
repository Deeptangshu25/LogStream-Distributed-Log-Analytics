package com.logstream.backend.api;

import com.logstream.backend.model.SearchRequest;
import com.logstream.backend.model.SearchResult;
import com.logstream.backend.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/search")
    public ResponseEntity<SearchResult> searchLogs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String host,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        SearchRequest request = new SearchRequest();

        request.setQuery(query);
        request.setService(service);
        request.setLevel(level);
        request.setHost(host);
        request.setStartTime(startTime);
        request.setEndTime(endTime);
        request.setPage(page);
        request.setSize(size);

        return ResponseEntity.ok(
                searchService.search(request)
        );
    }
}