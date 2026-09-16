package com.logstream.backend.model;

import java.util.ArrayList;
import java.util.List;

public class SearchResult {

    private List<LogEntry> logs;
    private long totalHits;
    private int page;
    private int size;

    public SearchResult() {
        this.logs = new ArrayList<>();
    }

    public SearchResult(
            List<LogEntry> logs,
            long totalHits,
            int page,
            int size) {

        this.logs = logs;
        this.totalHits = totalHits;
        this.page = page;
        this.size = size;
    }

    public List<LogEntry> getLogs() {
        return logs;
    }

    public void setLogs(List<LogEntry> logs) {
        this.logs = logs;
    }

    public long getTotalHits() {
        return totalHits;
    }

    public void setTotalHits(long totalHits) {
        this.totalHits = totalHits;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}