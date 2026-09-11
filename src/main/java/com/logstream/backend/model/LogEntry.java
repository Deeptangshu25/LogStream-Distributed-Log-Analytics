package com.logstream.backend.model;

import java.time.Instant;

public class LogEntry {

    private String id;
    private Instant timestamp;
    private LogLevel level;
    private String service;
    private String host;
    private String message;
    private long responseTimeMs;
    private String traceId;

    public LogEntry() {
    }

    public LogEntry(
            String id,
            Instant timestamp,
            LogLevel level,
            String service,
            String host,
            String message,
            long responseTimeMs,
            String traceId) {

        this.id = id;
        this.timestamp = timestamp;
        this.level = level;
        this.service = service;
        this.host = host;
        this.message = message;
        this.responseTimeMs = responseTimeMs;
        this.traceId = traceId;
    }

    public enum LogLevel {
        DEBUG,
        INFO,
        WARN,
        ERROR
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public LogLevel getLevel() {
        return level;
    }

    public void setLevel(LogLevel level) {
        this.level = level;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getResponseTimeMs() {
        return responseTimeMs;
    }

    public void setResponseTimeMs(long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }

    public String getTraceId() {
        return traceId;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }

    @Override
    public String toString() {
        return "LogEntry{" +
                "id='" + id + '\'' +
                ", timestamp=" + timestamp +
                ", level=" + level +
                ", service='" + service + '\'' +
                ", host='" + host + '\'' +
                ", message='" + message + '\'' +
                ", responseTimeMs=" + responseTimeMs +
                ", traceId='" + traceId + '\'' +
                '}';
    }
}