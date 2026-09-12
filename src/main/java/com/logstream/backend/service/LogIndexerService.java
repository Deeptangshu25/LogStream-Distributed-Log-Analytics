package com.logstream.backend.service;

import com.logstream.backend.model.LogEntry;

/**
 * Abstraction for forwarding validated logs
 * to the search/indexing pipeline.
 *
 * The actual Lucene implementation will be connected
 * during search-engine integration.
 */
public interface LogIndexerService {

    /**
     * Index a single log entry.
     *
     * @param log validated log entry
     */
    void index(LogEntry log);

    /**
     * Index multiple log entries.
     *
     * @param logs validated log entries
     */
    void indexBatch(Iterable<LogEntry> logs);
}