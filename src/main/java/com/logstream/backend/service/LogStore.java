package com.logstream.backend.service;

import com.logstream.backend.model.LogEntry;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class LogStore {

    private final List<LogEntry> logs = new ArrayList<>();

    public synchronized void add(LogEntry log) {
        if (log != null) {
            logs.add(log);
        }
    }

    public synchronized void addAll(Iterable<LogEntry> logs) {
        if (logs == null) {
            return;
        }

        for (LogEntry log : logs) {
            add(log);
        }
    }

    public synchronized List<LogEntry> getAll() {
        return new ArrayList<>(logs);
    }

    public synchronized int size() {
        return logs.size();
    }

    public synchronized void clear() {
        logs.clear();
    }
}