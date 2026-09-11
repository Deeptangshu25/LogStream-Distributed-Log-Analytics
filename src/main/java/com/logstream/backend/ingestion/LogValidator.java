package com.logstream.backend.ingestion;

import com.logstream.backend.model.LogEntry;
import org.springframework.stereotype.Component;

@Component
public class LogValidator {

    public boolean isValid(LogEntry log) {
        if (log == null) return false;
        if (isBlank(log.getId())) return false;
        if (log.getTimestamp() == null) return false;
        if (log.getLevel() == null) return false;
        if (isBlank(log.getService())) return false;
        if (isBlank(log.getHost())) return false;
        if (isBlank(log.getMessage())) return false;
        if (log.getResponseTimeMs() < 0) return false;

        return true;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}