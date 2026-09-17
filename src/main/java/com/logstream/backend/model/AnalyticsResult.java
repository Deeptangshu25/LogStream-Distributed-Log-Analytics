package com.logstream.backend.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class AnalyticsResult {

    private long totalLogs;
    private long errorCount;
    private long warnCount;
    private long infoCount;
    private long debugCount;
    private double averageResponseTimeMs;
    private Map<String, Long> logsByService;

    public AnalyticsResult() {
        this.logsByService = new LinkedHashMap<>();
    }

    public long getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(long totalLogs) {
        this.totalLogs = totalLogs;
    }

    public long getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(long errorCount) {
        this.errorCount = errorCount;
    }

    public long getWarnCount() {
        return warnCount;
    }

    public void setWarnCount(long warnCount) {
        this.warnCount = warnCount;
    }

    public long getInfoCount() {
        return infoCount;
    }

    public void setInfoCount(long infoCount) {
        this.infoCount = infoCount;
    }

    public long getDebugCount() {
        return debugCount;
    }

    public void setDebugCount(long debugCount) {
        this.debugCount = debugCount;
    }

    public double getAverageResponseTimeMs() {
        return averageResponseTimeMs;
    }

    public void setAverageResponseTimeMs(double averageResponseTimeMs) {
        this.averageResponseTimeMs = averageResponseTimeMs;
    }

    public Map<String, Long> getLogsByService() {
        return logsByService;
    }

    public void setLogsByService(Map<String, Long> logsByService) {
        this.logsByService = logsByService;
    }
}