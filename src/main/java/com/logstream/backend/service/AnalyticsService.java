package com.logstream.backend.service;

import com.logstream.backend.model.AnalyticsResult;
import com.logstream.backend.model.LogEntry;

import java.util.List;

public interface AnalyticsService {

    AnalyticsResult analyze(List<LogEntry> logs);
}