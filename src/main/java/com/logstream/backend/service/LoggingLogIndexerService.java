package com.logstream.backend.service;

import com.logstream.backend.model.LogEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoggingLogIndexerService implements LogIndexerService {

    private static final Logger logger =
            LoggerFactory.getLogger(LoggingLogIndexerService.class);

    @Override
    public void index(LogEntry log) {
        logger.info("Log ready for indexing: {}", log.getId());
    }

    @Override
    public void indexBatch(Iterable<LogEntry> logs) {
        for (LogEntry log : logs) {
            index(log);
        }
    }
}