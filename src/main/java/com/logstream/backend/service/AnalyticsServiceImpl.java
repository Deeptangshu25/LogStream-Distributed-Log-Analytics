package com.logstream.backend.service;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.model.LogEntry;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Override
    public AnalyticsResult analyze(List<LogEntry> logs) {

        AnalyticsResult result = new AnalyticsResult();

        if (logs == null || logs.isEmpty()) {
            return result;
        }

        long totalResponseTime = 0;

        Map<String, Long> logsByService = new LinkedHashMap<>();

        for (LogEntry log : logs) {

            if (log == null) {
                continue;
            }

            result.setTotalLogs(result.getTotalLogs() + 1);

            switch (log.getLevel()) {
                case ERROR -> result.setErrorCount(
                        result.getErrorCount() + 1
                );
                case WARN -> result.setWarnCount(
                        result.getWarnCount() + 1
                );
                case INFO -> result.setInfoCount(
                        result.getInfoCount() + 1
                );
                case DEBUG -> result.setDebugCount(
                        result.getDebugCount() + 1
                );
            }

            totalResponseTime += log.getResponseTimeMs();

            String service = log.getService();

            if (service != null && !service.isBlank()) {
                logsByService.merge(service, 1L, Long::sum);
            }
        }

        result.setLogsByService(logsByService);

        if (result.getTotalLogs() > 0) {
            result.setAverageResponseTimeMs(
                    (double) totalResponseTime / result.getTotalLogs()
            );
        }

        return result;
    }
}