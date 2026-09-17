package com.logstream.backend.api;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.service.AnalyticsService;
import com.logstream.backend.service.LogStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final LogStore logStore;

    public AnalyticsController(
            AnalyticsService analyticsService,
            LogStore logStore) {

        this.analyticsService = analyticsService;
        this.logStore = logStore;
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResult> getAnalytics() {

        AnalyticsResult result =
                analyticsService.analyze(
                        logStore.getAll()
                );

        return ResponseEntity.ok(result);
    }
}