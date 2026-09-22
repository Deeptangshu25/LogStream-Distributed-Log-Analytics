package com.logstream.backend.api;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.service.AnalyticsService;
import com.logstream.searchengine.search.LogSearchEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final LogSearchEngine logSearchEngine;

    public AnalyticsController(
            AnalyticsService analyticsService,
            LogSearchEngine logSearchEngine) {

        this.analyticsService = analyticsService;
        this.logSearchEngine = logSearchEngine;
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResult> getAnalytics() {

        AnalyticsResult result =
                analyticsService.analyze(
                        logSearchEngine.getAllLogs()
                );

        return ResponseEntity.ok(result);
    }
}
